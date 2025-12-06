/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { BarChart, ChartsProvider, ChartsThemeProvider } from '@overture-stack/arranger-charts';
import { useArrangerData } from '@overture-stack/arranger-components';
import { ReactElement, useMemo } from 'react';
import { CustomUIThemeInterface } from '../theme';
import ErrorBoundary from '../components/ErrorBoundary';
import { chartFilter } from '../utils/sqonHelpers';
import { shuffleArray } from '../utils/chartUtils';

const VitalStatusChart = (): ReactElement => {
    const theme = useTheme() as CustomUIThemeInterface;
    const { sqon, setSQON } = useArrangerData({ callerName: 'VitalStatusChart' });

    const chartFilters = useMemo(() => ({
        vitalStatus: chartFilter('data__vitalStatus', sqon, setSQON),
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
                Vital Status
            </h3>

            <div style={{ height: '360px' }}>
                <ErrorBoundary>
                    <ChartsProvider debugMode={false} loadingDelay={0}>
                        <ChartsThemeProvider colors={shuffledPalette}>
                            <BarChart
                                fieldName="data__vitalStatus"
                                maxBars={15}
                                handlers={{
                                    onClick: (config) => {
                                        return chartFilters.vitalStatus(config.data.key);
                                    },
                                }}
                                theme={{
                                    axisLeft: {
                                        legend: 'Status',
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

export default VitalStatusChart;

