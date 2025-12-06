/** @jsxImportSource @emotion/react */
/*
 *
 * Copyright (c) 2024 The Ontario Institute for Cancer Research. All rights reserved
 *
 *  This program and the accompanying materials are made available under the terms of
 *  the GNU Affero General Public License v3.0. You should have received a copy of the
 *  GNU Affero General Public License along with this program.
 *   If not, see <http://www.gnu.org/licenses/>.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 *  SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 *  IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

import { css, useTheme } from '@emotion/react';
import { BarChart, ChartsProvider, ChartsThemeProvider } from '@overture-stack/arranger-charts';
import { useArrangerData } from '@overture-stack/arranger-components';
import { ReactElement, useEffect, useState, useMemo } from 'react';
import { CustomUIThemeInterface } from '../theme';
import ErrorBoundary from '../components/ErrorBoundary';
import createArrangerFetcher from '../utils/arrangerFetcher';
import CustomBarTooltip from '../components/CustomBarTooltip';
import { chartFilter } from '../utils/sqonHelpers';
import { shuffleArray } from '../utils/chartUtils';

const arrangerFetcher = createArrangerFetcher({
    ARRANGER_API: 'http://localhost:5053',
});

const ancestryTotalQuery = `
	query ($sqon: JSON) {
		file {
			aggregations(filters: $sqon) {
				data__ancestry {
					buckets {
						key
					}
				}
			}
		}
	}
`;

const AncestryChart = (): ReactElement => {
    const theme = useTheme() as CustomUIThemeInterface;
    const { sqon, setSQON } = useArrangerData({ callerName: 'AncestryChart' });
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const chartFilters = useMemo(() => ({
        ancestry: chartFilter('data__ancestry', sqon, setSQON),
    }), [sqon, setSQON]);

    const shuffledPalette = useMemo(() => shuffleArray(theme.colors.chartPalette), []);

    useEffect(() => {
        arrangerFetcher({
            endpoint: 'graphql',
            body: JSON.stringify({
                variables: sqon ? { sqon } : {},
                query: ancestryTotalQuery,
            }),
        })
            .then((response: any) => {
                const data = response?.data?.file || response?.file;
                if (data) {
                    const ancestryBuckets = data.aggregations?.data__ancestry?.buckets || [];
                    setTotalCount(ancestryBuckets.length);
                }
                setLoading(false);
            })
            .catch((err: any) => {
                console.error('Error fetching ancestry total:', err);
                setLoading(false);
            });
    }, [sqon]);

    return (
        <div
            css={css`
				padding: 12px;
				background-color: ${theme.colors.white};
				border-radius: 8px;
				border: 1px solid #BABCC2;
				margin: 15px 0;
				position: relative;
			`}
        >
            <h3
                css={css`
					margin: 0 0 10px 0;
					color: ${theme.colors.black};
					font-size: 14px;
					font-weight: 600;
					font-family: 'Montserrat', sans-serif;
				`}
            >
                Ancestry Distribution
            </h3>

            {!loading && totalCount > 0 && (
                <div
                    css={css`
						position: absolute;
						top: 12px;
						right: 12px;
						font-size: 10px;
						color: ${theme.colors.black};
						font-family: 'Montserrat', sans-serif;
						font-weight: 600;
						background-color: #f5f5f5;
						border-radius: 4px;
						padding: 4px 8px;
					`}
                >
                    Top 5 of {totalCount}
                </div>
            )}

            <div style={{ height: '180px' }}>
                <ErrorBoundary>
                    <ChartsProvider debugMode={false} loadingDelay={0}>
                        <ChartsThemeProvider
                            colors={shuffledPalette}
                            components={{
                                TooltipComp: CustomBarTooltip,
                            }}
                        >
                            <BarChart
                                fieldName="data__ancestry"
                                maxBars={5}
                                handlers={{
                                    onClick: (config) => {
                                        return chartFilters.ancestry(config.data.key);
                                    },
                                }}
                                theme={{
                                    axisLeft: {
                                        legend: 'Ancestry',
                                    },
                                    axisBottom: {
                                        legend: 'Count',
                                    },
                                }}
                            />
                        </ChartsThemeProvider>
                    </ChartsProvider>
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default AncestryChart;
