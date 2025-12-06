/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import { BarChart, ChartsProvider, ChartsThemeProvider } from '@overture-stack/arranger-charts';
import { useArrangerData } from '@overture-stack/arranger-components';
import { ReactElement, useMemo } from 'react';
import { CustomUIThemeInterface } from '../theme';
import ErrorBoundary from '../components/ErrorBoundary';
import { chartFilter } from '../utils/sqonHelpers';
import { shuffleArray } from '../utils/chartUtils';

const IdentifiedGenderChart = (): ReactElement => {
    const theme = useTheme() as CustomUIThemeInterface;
    const { sqon, setSQON } = useArrangerData({ callerName: 'IdentifiedGenderChart' });

    const chartFilters = useMemo(() => ({
        selfIdentifiedGender: chartFilter('data__selfIdentifiedGender', sqon, setSQON),
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
                Self-Identified Gender
            </h3>

            <div style={{ height: '300px' }}>
                <ErrorBoundary>
                    <ChartsProvider debugMode={false} loadingDelay={0}>
                        <ChartsThemeProvider colors={shuffledPalette}>
                            <BarChart
                                fieldName="data__selfIdentifiedGender"
                                maxBars={15}
                                handlers={{
                                    onClick: (config) => {
                                        return chartFilters.selfIdentifiedGender(config.data.key);
                                    },
                                }}
                                theme={{
                                    axisLeft: {
                                        legend: 'Gender',
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

export default IdentifiedGenderChart;

