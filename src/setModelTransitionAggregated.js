import { tooltip } from './tooltip';
import { drawTitle } from './drawTitle';
import * as d3 from 'd3';
export function setModelTransitionAggregated(selector, data, options) {
  const currentAlgo = options.currentAlgo;
  const xVariable = options.xVariable;
  const predictVariable = options.predictVariable;
  const responseVariable = options.responseColumn;
  const xVariables = options.xVariables;
  const tooltipVariables = options.tooltipColumns;
  const currentAlgoLabel = options.currentAlgoLabel;
  const projectTitle = options.projectTitle;
  const projectLink = options.projectLink;
  const dataText = options.dataText;
  const scatterplotUpdateFunctions = options.scatterplotUpdateFunctions;
  const categoricalColumns = options.categoricalColumns;

  d3.select(selector)
    .on('click', click);

  function click() {
    // if the button clicked is already selected
    // don't show a transition
    const wrapperId = d3.select('g.dependent').attr('id');
    if (wrapperId === currentAlgo) { return; };

    const marksDelay = 1000;

    // set new id
    d3.select('g.dependent')
      .attr('id', currentAlgo);

    // set new id
    d3.selectAll('g.independent')
      .attr('id', currentAlgo);

    // transition marks from the dependent variable plot g
    // TODO handle case where this plot is a boxplot
    const index = Number(d3.select('#dropdown').property('value'));
    const currentLabel = categoricalColumns[index];
    const scatterplotUpdateOptions = {
      marksDelay,
      groupByVariable: currentLabel
    }
    scatterplotUpdateFunctions[predictVariable](data, scatterplotUpdateOptions);

    // transition marks for independent variable scatterplots
    xVariables.forEach(x => {
      // console.log('x from setModelTransitionAggregated', x);
      scatterplotUpdateFunctions[x](data, scatterplotUpdateOptions);
    })

    // transition x-axis label
    d3.select('g.dependent').select('text.x.title')
      .transition()
      .duration(1000)
      .style('opacity', 0)
      .transition()
      .duration(0)
      .delay(0 + marksDelay)
      .text(`${xVariable} (${responseVariable})`)
      .transition()
      .duration(1000)
      .style('opacity', 1);

    // transition model label
    d3.select('g.dependent').select('text.modelLabel')
      .transition()
      .duration(1000)
      .style('opacity', 0)
      .transition()
      .duration(0)
      .delay(0 + marksDelay)
      .text(`${currentAlgoLabel}`)
      .transition()
      .duration(1000)
      .style('opacity', 0.15);

    // set the tooltip for with new tooltipVariables
    const lastIndex = tooltipVariables.length - 1;
    tooltipVariables[lastIndex].name = xVariable;
    const tip = tooltip(tooltipVariables);
    d3.select('svg.dependent').call(tip);

    // update the subtitle
    const subtitleOptions = {
      projectTitle,
      projectLink,
      currentAlgoLabel,
      dataText
    }
    drawTitle('p#subTitle', subtitleOptions);

    // transition exploding boxplots for categorical independent variables
    // TODO

    // TODO decide how to updateMarksStyles
  };
}