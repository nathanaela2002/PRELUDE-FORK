/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactElement } from 'react';

interface CustomBarTooltipProps {
	indexValue?: string;
	value?: number;
	color?: string;
	label?: string;
	formattedValue?: string | number;
	[key: string]: any; // Allow any additional props from Nivo
}

const CustomBarTooltip = (props: CustomBarTooltipProps): ReactElement => {
	const { indexValue, value, label, formattedValue } = props;
	
	// Use label or indexValue, formattedValue or value
	const displayLabel = label || indexValue || '';
	const displayValue = formattedValue !== undefined ? formattedValue : (value !== undefined ? value : 0);
	
	return (
		<div
			css={css`
				background: rgba(0, 0, 0, 0.85);
				color: white;
				padding: 8px 12px;
				border-radius: 4px;
				font-size: 12px;
				font-family: 'Montserrat', sans-serif;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				pointer-events: none;
				position: relative;
				white-space: nowrap;
				z-index: 1000;
			`}
		>
			<div
				css={css`
					font-weight: 600;
					margin-bottom: 4px;
				`}
			>
				{displayLabel}:
			</div>
			<div
				css={css`
					font-weight: 700;
				`}
			>
				{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue} Participants
			</div>
			<div
				css={css`
					position: absolute;
					left: -6px;
					top: 50%;
					transform: translateY(-50%);
					width: 0;
					height: 0;
					border-top: 6px solid transparent;
					border-bottom: 6px solid transparent;
					border-right: 6px solid rgba(0, 0, 0, 0.85);
				`}
			/>
		</div>
	);
};

export default CustomBarTooltip;

