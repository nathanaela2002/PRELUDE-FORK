# Prelude Custom-UI Researcher Data Exploration Portal

## About This Project

This repository is a fork and extension of the open-source [Prelude](https://github.com/overture-stack/prelude/tree/main) project, which is part of the [Overture Stack](https://github.com/overture-stack) ecosystem. 

**Prelude** is a toolkit for planning and developing Overture data platform implementations, providing incremental phases for building and validating platform requirements. The original Prelude includes tools like Composer (for configuration generation), Conductor (for data management), and Stage (a Next.js frontend portal).

**This Custom-UI fork** extends Prelude by adding a dedicated React-based data exploration interface (`apps/custom-ui`) that integrates with Arranger Charts for interactive data visualization. While the original Prelude focuses on the Stage portal for documentation and data exploration, this fork provides an alternative custom user interface specifically designed for researcher workflows with enhanced chart integration and filtering capabilities.

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

Start the custom-ui development server:

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

## Project Structure

The project follows a modular structure with two main applications: Conductor (for data management) and Stage (for the front-end portal).

```
├── apps/
│   ├── composer/                 # Config generation tool
│   │   └── src/                  # Source code
│   │       ├── cli/              # CLI interface
│   │       ├── commands/         # Command implementations
│   │       ├── services/         # Core functions for config generation
│   │       └── utils/            # Utility functions
│   │
│   ├── conductor/                # Data management tool
│   │   ├── src/                  # Source code
│   │   │   ├── cli/              # CLI interface
│   │   │   ├── commands/         # Command implementations
│   │   │   ├── services/         # Core services (ES, Lectern, etc.)
│   │   │   └── utils/            # Utility functions
│   │   ├── configs/              # Configuration files
│   │   │   ├── arrangerConfigs/  # Arranger UI configurations
│   │   │   ├── elasticsearchConfigs/ # Elasticsearch mappings
│   │   │   ├── lecternDictionaries/ # Data dictionaries
│   │   │   └── songSchemas/      # Song schemas
│   │   └── scripts/              # Deployment and service scripts
│   │       ├── deployments/      # Phase deployment scripts
│   │       └── services/         # Service management scripts
│   │
│   └── stage/                    # Frontend portal
│       ├── components/
│       │   ├── pages/            # Page-specific components
│       │   └── theme/            # Theming
│       ├── pages/                # Next.js pages
│       └── public/               # Static assets
│           └── docs/             # Markdown documentation files
│               └── images/       # Documentation images
│
├── configs/                      # Symlink to conductor configs
├── data/                         # Data files
└── docs/                         # Symlink to Stage docs
```



