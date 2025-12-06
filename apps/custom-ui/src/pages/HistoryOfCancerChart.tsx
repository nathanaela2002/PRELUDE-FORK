/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { BarChart, ChartsProvider, ChartsThemeProvider } from '@overture-stack/arranger-charts';
import { useArrangerData } from '@overture-stack/arranger-components';
import { ReactElement, useMemo } from 'react';
import { CustomUIThemeInterface } from '../theme';
import ErrorBoundary from '../components/ErrorBoundary';
import { chartFilter } from '../utils/sqonHelpers';
import { shuffleArray } from '../utils/chartUtils';

const HistoryOfCancerChart = (): ReactElement => {
    const theme = useTheme() as CustomUIThemeInterface;
    const { sqon, setSQON } = useArrangerData({ callerName: 'HistoryOfCancerChart' });

    const chartFilters = useMemo(() => ({
        historyOfCancer: chartFilter('data__historyOfCancer', sqon, setSQON),
    }), [sqon, setSQON]);

    const shuffledPalette = useMemo(() => shuffleArray(theme.colors.chartPalette), []);

    return (
        <div
            css={css`
				padding: 20px;
				background-color: ${theme.colors.white};
				border-radius: 8px;
				border: 1px solid #BABCC2;
				margin: 15px 0;
			`}
        >
            <h3
                css={css`
					margin: 0 0 20px 0;
					color: ${theme.colors.black};
					font-family: 'Montserrat', sans-serif;
					font-size: 18px;
					font-weight: 600;
				`}
            >
                History of Cancer
            </h3>

            <div style={{ height: '360px' }}>
                <ErrorBoundary>
                    <ChartsProvider debugMode={false} loadingDelay={0}>
                        <ChartsThemeProvider colors={shuffledPalette}>
                            <BarChart
                                fieldName="data__historyOfCancer"
                                maxBars={15}
                                handlers={{
                                    onClick: (config) => {
                                        return chartFilters.historyOfCancer(config.data.key);
                                    },
                                }}
                                theme={{
                                    axisLeft: {
                                        legend: 'History',
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

export default HistoryOfCancerChart;

