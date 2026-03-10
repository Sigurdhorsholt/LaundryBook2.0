import { useLazyPingQuery } from './features/ping/pingApi'
import './App.css'

function App() {
  const [ping, { data, isFetching, isError, error }] = useLazyPingQuery()

  return (
    <div className="card">
      <h1>LaundryBook</h1>
      <button onClick={() => ping()} disabled={isFetching}>
        {isFetching ? 'Pinging…' : 'Ping backend'}
      </button>

      {data && (
        <table>
          <tbody>
            <tr><th>message</th><td>{data.message}</td></tr>
            <tr><th>environment</th><td>{data.environment}</td></tr>
            <tr><th>server time</th><td>{new Date(data.serverTime).toLocaleString()}</td></tr>
            <tr><th>version</th><td>{data.version}</td></tr>
          </tbody>
        </table>
      )}

      {isError && (
        <p style={{ color: 'red' }}>
          {JSON.stringify(error)}
        </p>
      )}
    </div>
  )
}

export default App
