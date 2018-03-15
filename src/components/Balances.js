import React from 'react'

export default function ({data}) {
  const balanceItems = data.map(item =>
    <tr key={item.address}>
      <td>
        {item.address}:
      </td>
      <td>
        {item.amount}
      </td>
    </tr>
  )
  return (
    <div>
      <h4>Accounts balances</h4>
      <div>
        {balanceItems.length ?
          <table className="App-balances">
            <tbody>{balanceItems}</tbody>
          </table>
          : <em>no data yet</em>}
      </div>
    </div>
  )
}
