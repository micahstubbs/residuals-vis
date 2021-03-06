import * as React from 'react';
import { drawResidualsVis } from './drawResidualsVis';
import { Nav } from './components/Nav';
import { IndependentVariableCard } from './components/IndependentVariableCard';
import { IndependentVariableScatterplot } from './components/IndependentVariableScatterplot';
import { SectionNav } from './components/SectionNav';
import { Title } from './components/Title';

export class ResidualsVis extends React.Component<any, any> {
  componentDidMount() {
    drawResidualsVis(this.props);
  }

  render() {
    console.log('this.props from ResidualsVis', this.props);

    const independentVariableCardComponents = this.props.config.xColumns.map((x, i) => {
      // strip the spaces out of x
      x = x.replace(/\s/g, '');
      return (
        <IndependentVariableCard x={x} i={i} key={i}/>
      );
    });

    const independentVariableScatterplotComponents = this.props.config.xColumns.map((x, i) => {
      // strip the spaces out of x
      x = x.replace(/\s/g, '');
      return (
        <IndependentVariableScatterplot x={x} i={i} key={i}/>
      );
    });

    return (
      <div className='flex-container' style={{
        display: 'flex',
        flexDirection: 'column',
        flexBasis: 'auto',
        flexGrow: 0,
        flexShrink: 1
      }}>
        <Nav config={this.props.config}/>
        <Title title='deviances' config={this.props.config}/>
        <div className='dependent-variable-plot-container' style={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap:'nowrap',
          paddingLeft: '60px'
        }}>
        </div>
        <SectionNav title='predictor deviances'/>
        <div className='independent-variable-plot-container' style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap:'nowrap',
          justifyContent: 'flex-start'
        }}>
          <div className='card-container' style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            flexWrap:'nowrap',
            flexBasis: 'auto',
            flexGrow: 0,
            flexShrink: 0,
            margin: '-5px',
            paddingLeft: '60px'
          }}>
            {independentVariableCardComponents}
          </div>
          <div className='scatterplot-container' id='scatterplot-container' style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexWrap:'nowrap',
            flexBasis: 'auto',
            flexGrow: 1,
            flexShrink: 1,
            margin: '-5px',
          }}>
            {independentVariableScatterplotComponents}
          </div>
        </div>
        <div className='boxplot-container' style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap:'wrap'
        }}>
        </div>
      </div>
    );
  }
}
