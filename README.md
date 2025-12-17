# Prelude Custom-UI Researcher Data Exploration Portal

## About This Project

This repository is a fork and extension of the open-source [Prelude](https://github.com/overture-stack/prelude/tree/main) project, which is part of the [Overture Stack](https://github.com/overture-stack) ecosystem. 

**Prelude** is a toolkit for planning and developing Overture data platform implementations, providing incremental phases for building and validating platform requirements. The original Prelude includes tools like Composer (for configuration generation), Conductor (for data management), and Stage (a Next.js frontend portal).

**This Custom-UI fork** extends Prelude by adding a dedicated React-based data exploration interface (`apps/custom-ui`) that integrates with [Arranger Charts](https://github.com/overture-stack/arranger/tree/release-charts/modules) for interactive data visualization. While the original Prelude focuses on the Stage portal for documentation and data exploration, this fork provides an alternative custom user interface specifically designed for researcher workflows with enhanced chart integration and filtering capabilities.

<img width="3024" height="1712" alt="image" src="https://github.com/user-attachments/assets/6ffab42c-dcd0-4067-a059-4c8a777bdcb1" />

## Getting Started

You will need:

- **Docker Desktop 4.39.0+** with:
  - 8-core CPU minimum
  - 8 GB memory
  - 2 GB swap
  - 64 GB virtual disk
- **Node.js 20.18.1+ and npm 9+**
- **Linux/macOS environment**

> [!NOTE] **Windows Users:** Please use WSL2 with a Bash terminal for all commands in this documentation. Prelude is not supported on native Windows environments.

Run the pre-deployment check to verify your environment:

```bash
make phase0
```

The CLI will provide you with instructions on next steps.

## Development Phases

Prelude is structured into four incremental phases:

![Development Phases](apps/stage/public/docs/images/preludeOverview.png "Prelude Development Phases")

| **Phase**                               | **Focus**                                           | **Components**                                  |
| --------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| **Phase 0:** Pre-Deployment Check       | Making sure you have all the required prerequisites | Docker, appropriate resources for docker & Node |
| **Phase 1:** Data Exploration & Theming | Data visualization in the portal                    | Elasticsearch, Arranger, Stage                  |

## Supplemental Tools

### Composer

Transforms your data (CSV or JSON) into base Overture configurations including Elasticsearch Mappings, Arranger UI Configs, Lectern Dictionary and Schema, Song Schema. This utility greatly reduces tedious manual configurations.

Depending on the command Composer can input CSV or JSON file(s) that represent your data and output the following:

| Output                            | Purpose                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| **Elasticsearch Mappings**        | Defines the structure and indexing settings for your data            |
| **Arranger UI Configs**           | Configures the user interface for data exploration and visualization |

### Conductor

Conductor runs the automated deployments from the `/apps/conductor/scripts` directory. It can also be run as a command line client made to streamline interactions with various Overture API endpoints.

As summary of command line client interactions is provided in the table below:

| Feature                      | Description                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **CSV to Elasticsearch ETL** | Validate, transform and load CSV data to a specified elasticsearch index.                                  |
| **Configuration Management** | Submit dictionaries to Lectern, Register Lectern dictionaries with Lyric, Update Song Schema and study Ids |
| **Data Management**          | Upload tabular data to Lyric, Upload and publish file data and metadata.                                   |

### Deployment specific Make Commands

| Phase         | Description                                                     | Command          |
| ------------- | --------------------------------------------------------------- | ---------------- |
| **Phase 0**   | Pre-Deployment Check                                            | `make phase0`    |
| **Phase 1**   | Data Exploration & Theming                                      | `make phase1`    |
| **Stage Dev** | Run Stage in development mode                                   | `make stage-dev` |
| **Restart**   | Restart containers for a specific profile while preserving data | `make restart`   |
| **Reset**     | Reset all containers and volumes                                | `make reset`     |

## Development

### Custom-UI Local Development Setup

This section covers setting up the custom-ui application for local development, including all required backend services.

#### Prerequisites

- Docker Desktop 4.39.0+ running
- Node.js 20.18.1+ and npm 9+
- All services from Phase 1 must be running (Elasticsearch, Arranger, etc.)

#### Step 1: Start Backend Services

Start the required backend services using Docker Compose:

```bash
make phase1
```

This will start:
- Elasticsearch (port 9200)
- Arranger servers for datatables (ports 5050-5054)
- Conductor (port 9204)

Wait for all services to be healthy before proceeding.

#### Step 2: Install Conductor CLI

The Conductor CLI is required for uploading data and managing configurations:

```bash
cd ./apps/composer
npm install
npm run build
npm install -g .
```

This installs the `conductor` command globally, allowing you to use it from any directory.

#### Step 3: Upload Sample Data

Upload your CSV data to Elasticsearch:

```bash
conductor upload -f ./data/participant.csv -i datatable4-index
```

This command:
- Validates the CSV file
- Transforms it to match the Elasticsearch mapping
- Loads it into the `datatable4-index` index

#### Step 4: Install Custom-UI Dependencies

Navigate to the custom-ui directory and install dependencies:

```bash
cd ./apps/custom-ui
npm install
```

#### Step 5: Run Custom-UI Development Server

Start the custom-ui development server from the apps/custom-ui directory:

```bash
npm run dev
```

The application will be available at `http://localhost:3002`.

#### Creating New Elasticsearch and Arranger Configurations

CAUTION: The Elasticsearch mappings and Arranger configurations for datatable4 are already created and configured. Only follow these steps if you need to create configurations for a new datatable.

To generate new Elasticsearch mappings from a CSV file:

```bash
composer -p ElasticsearchMapping -f ./data/participant.csv -i datatable4 -o ./configs/elasticsearchConfigs/datatable4-mapping.json
```

To generate new Arranger configurations from an Elasticsearch mapping:

```bash
composer -p ArrangerConfigs -f ./configs/elasticsearchConfigs/datatable4-mapping.json -o ./configs/arrangerConfigs/datatable4/
```

These commands will:
1. Analyze your CSV data structure
2. Generate appropriate Elasticsearch field mappings
3. Create Arranger UI configuration files (base.json, extended.json, facets.json, table.json)

After generating new configurations, restart the arranger services to load the new configs:

```bash
make reset
```

## Custom-UI Charts Implementation Architecture
At a high level, the architecture consists of three main parts: Custom‑UI (a React + Vite frontend used by researchers), the Arranger API (a GraphQL gateway that translates queries into Elasticsearch requests), and Elasticsearch (the underlying data store that executes searches and aggregations).

<img width="217" height="616" alt="image" src="https://github.com/user-attachments/assets/2a646ca7-a8e6-4a10-93b5-0e5cf2c2f6ea" />

#### Detailed Flow 
1. User Interaction: User clicks a bar in a chart (e.g., GenderChart), selects/deselects facet checkboxes in Facets, or clears filters via the QueryBar (SQONViewer).
2. SQON Update (Filter State): Chart click handlers use chartFilter from sqonHelpers to toggle filters based on the bar’s value, while Facets and SQONViewer call setSQON from the Arranger context.
3. Context Broadcast: ArrangerDataProvider notifies all used components (charts, facets, query bar) via React Context that the SQON has changed, so they can re-evaluate their data needs.
4. GraphQL Requests:
   - Charts: Arranger Charts automatically build a GraphQL aggregation query using each chart’s fieldName (aggregation format, e.g., data__gender) and include the current sqon as filters.
   - Facets: The Aggregations component reads backend Arranger config (e.g., facets.json) and issues a single GraphQL request for all configured facet fields, filtered by sqon.
   - Query Bar: Components like QueryBar.tsx (via SQONViewer and Arranger components) rely on the shared Arranger data context, which issues GraphQL requests under the hood to fetch the aggregations needed to display and manage the current filter state.
5. Arranger Fetcher: Converts the GraphQL query strings into HTTP POST requests and sends them to the Arranger API at /graphql, with the request body containing the GraphQL query and SQON variables.
6. Arranger API: Receives the HTTP POST request, validates it against its GraphQL schema, and translates the aggregations plus SQON filters into an Elasticsearch aggregation query for the configured index.
7. Elasticsearch: Executes the aggregation query and returns bucketed results (keys and document counts) to the Arranger API.

<img width="2042" height="1286" alt="image" src="https://github.com/user-attachments/assets/b76f35ec-6e55-4c2a-a01f-ad3289bf1c83" />


