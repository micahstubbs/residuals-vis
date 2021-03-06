import { parseData } from './parseData';
import { getGlobalExtents } from './getGlobalExtents';
import { dropdown } from './dropdown';
import { setModelTransitionAggregated } from './setModelTransitionAggregated';
import { setModelTransition } from './setModelTransition';

import * as d3VoronoiScatterplot from 'd3-voronoi-scatterplot';
import * as bsn from 'bootstrap.native';
import * as d3 from 'd3';

export function drawVisFromData(error, chartOptions, ...args) {
  console.log('args', args);
  console.log('arguments', arguments);
  console.log('d3VoronoiScatterplot', d3VoronoiScatterplot);

  const numericColumns = chartOptions.numericColumns;
  const idColumn = chartOptions.idColumn;
  const aggregated = chartOptions.aggregated;
  // const models = chartOptions.models;
  const models = chartOptions.modelIDs;
  const projectTitle = chartOptions.projectTitle;
  const projectLink = chartOptions.projectLink;
  const currentAlgo = chartOptions.currentAlgo;
  const currentModelLabel = chartOptions.currentModelLabel;
  const dataText = chartOptions.dataText;
  const predictColumn = chartOptions.predictColumn;
  const xColumns = chartOptions.xColumns;
  const yColumn = chartOptions.yColumn;
  const width = chartOptions.width;
  const tooltipColumns = chartOptions.tooltipColumns;
  const responseColumn = chartOptions.responseColumn;
  const marks = chartOptions.marks;
  const categoricalColumns = chartOptions.categoricalColumns;
  const sortBoxplots = chartOptions.sortBoxplots;
  const problemType = chartOptions.problemType;
  const margin = { left: 120, top: 20, right: 80, bottom: 20 }; 
  const algos = chartOptions.algos;
  const projectTitleNote = chartOptions.projectTitleNote;
  const yScaleType = chartOptions.yScaleType;
  const yScaleExponent = chartOptions.yScaleExponent;
  const modelMetrics = chartOptions.modelMetrics;
  const columnAliasLookup = chartOptions.columnAliasLookup;

  console.log('models', models);

  let options;
  let data;
  let datasets = {};
  if (typeof aggregated === 'undefined') {
    options = {
      numericColumns,
      idColumn
    }
    const inputData = args[0];
    data = parseData(inputData, options); 
  } else {
    options = {
      numericColumns,
      idColumn
    }

    models.forEach((model, i) => {
      options.idPrefix = model;
      const currentData = args[i];
      console.log('currentData', currentData);
      const parsedData = parseData(currentData, options)
      datasets[model] = parsedData;
    })

    console.log('datasets object', datasets);

    // set a default value for `data`
    data = datasets[currentAlgo];
  }

  // calcuate global extents, if not specified
  let globalExtents = {};

  // if a global extent is specified
  // use it for the predictColumn
  globalExtents[predictColumn] = chartOptions.globalExtents;

  const scatterplotXVariables = xColumns.concat([predictColumn]);
  console.log('scatterplotXVariables', scatterplotXVariables);

  scatterplotXVariables.forEach(x => {
    if (typeof globalExtents[x] === 'undefined') {
      if (typeof aggregated !== 'undefined') {
        options = {
          xVariable: x,
          yVariable: yColumn,
          combined: undefined,
          models
        }
        globalExtents[x] = getGlobalExtents(datasets, options);
      } else {
        options = {
          xVariable: x,
          yVariable: yColumn,
          models,
          combined: true
        }
        globalExtents[x] = getGlobalExtents(data, options);
      }
    }
  })
  console.log('globalExtents', globalExtents);

  //
  // residuals vs prediction plot
  //
  // if columns aliases are specified, use them as labels
  let xLabelDetail = responseColumn;
  if (typeof columnAliasLookup[xLabelDetail] !== 'undefined') {
    xLabelDetail = columnAliasLookup[xLabelDetail];
  }

  options = {
    width,
    dynamicWidth: true,
    xVariable: predictColumn,
    yVariable: yColumn,
    idVariable: idColumn,
    tooltipColumns,
    numericColumns,
    xLabelDetail,
    // xLabelTransform: 'top',
    // yLabelTransform: 'left',
    yLabelTransform: [-10, -10, 0],
    wrapperId: currentAlgo,
    wrapperLabel: currentModelLabel,
    dependent: true,
    globalExtents: globalExtents[predictColumn],
    marks,
    categoricalColumns,
    sortBoxplots,
    chartOptions,
    voronoiStroke: 'none',
    yScaleType,
    yScaleExponent,
    margin: { left: 120, top: 20, right: 80, bottom: 40 },
    xDroplineTextFormat: ',.0f',
    yDroplineTextFormat: ',.0f'
  }
  const scatterplotUpdateFunctions = {};
  if (problemType === 'classification') {
    drawExplodingBoxplot('.dependent-variable-plot-container', data, options);
  } else {
    d3.select('.dependent-variable-plot-container')
      .append('div')
      .attr('id', `${predictColumn}`);
    scatterplotUpdateFunctions[predictColumn] = d3VoronoiScatterplot.drawVoronoiScatterplot(`#${predictColumn}`, data, options);
  }

  // get the width of the dependent variable plot at the top
  const topPlotWidth = document.getElementById(`${predictColumn}`).clientWidth;
  const leftPadding = 120;
  const rightPadding = 80;
  const basisWidth = topPlotWidth - leftPadding - rightPadding;
  console.log('topPlotWidth', topPlotWidth);
  
  //
  // residuals vs independent variables scatterplots
  //
  xColumns.forEach(x => {
    // if columns aliases are specified, use them as labels
    let xLabel = x;
    if (typeof columnAliasLookup[xLabel] !== 'undefined') {
      xLabel = columnAliasLookup[xLabel];
    }
    
    // store the original value of x 
    const xOriginal = x;
    // strip the spaces out of x
    x = x.replace(/\s/g, '');
    console.log('x from drawVisFromData', x);

    const card = d3.select(`#${x}Card`);
    const plot = d3.select(`#${x}Plot`);

    // description
    const textBox = card.append('div')
      .attr('id', `${x}Text`)
      // .style('border', '1px solid lightgray')
      .style('padding', '5px')
      .style('margin-left', '5px')
      .style('margin-top', '5px')
      .style('margin-bottom', '5px')
      // .style('width', `${basisWidth * 0.20}px`);

    textBox.append('p')
      // .style('white-space', 'nowrap')
      .style('text-align', 'right')
      .style('font-weight', '600')
      .style('padding', '5px')
      .html(`${xLabel}<br>numeric`);

    // plot
    plot.append('div')
      .attr('id', `${x}Plot`)
      // .style('border', '1px solid lightgray')
      .style('padding', '5px')
      .style('margin-right', '5px')
      .style('margin-top', '5px')
      .style('margin-bottom', '5px')
      // .style('width', `${basisWidth * 0.80}px`);

    const plotWidth = document.getElementById(`scatterplot-container`).clientWidth - leftPadding;
    console.log('width of top plot', width);
    console.log('plotWidth', plotWidth);

    options = {
      width: plotWidth,
      // TODO: refactor white space in variable names edge case handling
      xVariable: xOriginal, 
      yVariable: yColumn,
      idVariable: idColumn,
      xLabel,
      tooltipColumns,
      numericColumns,
      wrapperId: currentAlgo,
      wrapperLabel: currentModelLabel,
      // hideXLabel: true,
      // yLabelTransform: 'left',
      yLabelTransform: [-10, -10, 0],
      globalExtents: globalExtents[x],
      marks,
      yScaleType,
      yScaleExponent,
      margin: { left: 120, top: 20, right: 80, bottom: 40 },
      xDroplineTextFormat: ',.0f',
      yDroplineTextFormat: ',.0f'
    }
    console.log('data passed to drawVoronoiScatterplot for independent variable plot', data);
    scatterplotUpdateFunctions[x] = d3VoronoiScatterplot.drawVoronoiScatterplot(`#${x}Plot`, data, options);
  })

  // draw exploding boxplots for categorical independent variables
  // const testArray = [];
  // testArray.push(categoricalColumns[1]);
  // testArray.push(categoricalColumns[2]);
  // testArray.forEach(x => {
  categoricalColumns.forEach(x => {
    options = {
      xVariable: x,
      yVariable: yColumn,
      marks,
      categoricalColumns,
      globalExtents,
      sortBoxplots,
      chartOptions
    }
    // comment out for now
    // drawExplodingBoxplot('.boxplot-container', data, options);
  })


  // create the dropdown menu
  const dropdownOptions = {
    chartOptions
  }
  dropdown('.nav', data, dropdownOptions);

  //
  // setup transition event listeners
  //

  // options common to all algos
  options = {
    margin,
    width,
    responseColumn,
    tooltipColumns,
    categoricalColumns,
    projectTitle,
    projectLink,
    dataText,
    algos,
    globalExtents,
    marks,
    chartOptions,
    idVariable: idColumn,
  }

  const modelLabels = {
    glm: 'Generalized Linear Model',
    drf: 'Distributed Random Forest',
    gbm: 'Gradient Boosting Method',
    dl: 'Deep Learning',
    deeplearning: 'Deep Learning'
  };

  if (typeof aggregated === 'undefined') {
    // deep learning button
    options.xVariable = 'dlPredict';
    options.yVariable = 'dlResidual';
    options.currentAlgo = 'dl';
    options.currentModelLabel = 'Deep Learning';
    setModelTransition('#dlButton', data, options);

    // distributed random forest button
    options.xVariable = 'drfPredict';
    options.yVariable = 'drfResidual';
    options.currentAlgo = 'drf';
    options.currentModelLabel = 'Distributed Random Forest';
    setModelTransition('#drfButton', data, options);

    // gradient boosting method button
    options.xVariable = 'gbmPredict';
    options.yVariable = 'gbmResidual';
    options.currentAlgo = 'gbm';
    options.currentModelLabel = 'Gradient Boosting Method';
    setModelTransition('#gbmButton', data, options);

    // generalized linear model button
    options.xVariable = 'glmPredict';
    options.yVariable = 'glmResidual';
    options.currentAlgo = 'glm';
    options.currentModelLabel = 'Generalized Linear Model';
    setModelTransition('#glmButton', data, options);
  } else {
    options.scatterplotUpdateFunctions = scatterplotUpdateFunctions;
    options.predictVariable = predictColumn;
    options.xVariables = xColumns;
    options.xVariable = predictColumn;
    options.yVariable = yColumn;
    options.modelMetrics = modelMetrics;

    models.forEach(model => {
      const modelPrefix = model.split('-', 1)[0];
      options.currentAlgo = model;
      options.currentModelLabel = modelLabels[modelPrefix];
      const buttonID = `#${model}Button`;
      setModelTransitionAggregated(buttonID, datasets[model], options);
    })
  }

}