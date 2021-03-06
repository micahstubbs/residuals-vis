import * as React from 'react';

export function IndependentVariableScatterplot(props) {
  return (
    <div id={`${props.x}Plot`} className='plot' key={props.i} style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexBasis: 'auto',
      flexGrow: 1,
      flexShrink: 1
    }}>
    </div>
  );
}
