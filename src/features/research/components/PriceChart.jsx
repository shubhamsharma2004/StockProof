import { skipToken } from "@reduxjs/toolkit/query/react";
import { useDispatch, useSelector } from "react-redux";
import { CHART_RANGES, tickFormatterFor, useGetChartQuery } from "../../market-data/index.js";
import { formatDateTime } from "../../../shared/lib/format.js";
import AreaChart from "../../../shared/ui/AreaChart.jsx";
import RangePills from "../../../shared/ui/RangePills.jsx";
import { chartRangeChanged } from "../model/researchSlice.js";
import { selectChartRange, selectLiveSymbol, selectMoney } from "../model/selectors.js";

const RANGE_OPTIONS = CHART_RANGES.map((r) => ({ key: r.key, label: r.short }));

export default function PriceChart() {
  const dispatch = useDispatch();
  const symbol = useSelector(selectLiveSymbol);
  const range = useSelector(selectChartRange);
  const money = useSelector(selectMoney);
  const { currentData: points, isFetching, isError } = useGetChartQuery(symbol ? { symbol, range } : skipToken);

  return (
    <section className="panel-card price-chart-card">
      <div className="panel-card-head">
        <h2 className="panel-title">Price Chart</h2>
        <RangePills options={RANGE_OPTIONS} value={range} onChange={(key) => dispatch(chartRangeChanged(key))} />
      </div>

      {isFetching && !points ? (
        <div className="chart-placeholder">
          <div className="skeleton skeleton-chart" />
        </div>
      ) : !points || points.length < 2 ? (
        <div className="chart-placeholder">
          <p>{isError ? "Price chart unavailable right now." : "Not enough price history for this range."}</p>
        </div>
      ) : (
        <AreaChart
          points={points}
          height={260}
          formatValue={money.price}
          formatTick={tickFormatterFor(range)}
          formatTooltipTime={formatDateTime}
          ariaLabel="Closing price over the selected range"
        />
      )}
    </section>
  );
}
