import useSWR from 'swr';

async function fetchAPI(key) {
  const response = await fetch(key);
  const data = await response.json();
  return data;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <h2>Dependências</h2>
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { data, isLoading } = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = 'Carregando...';

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString('pt-BR');
  }

  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { data, isLoading } = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return 'Carregando...';
  }

  return (
    <div>
      <h3>Banco de dados: </h3>
      <div>
        <p>Versão: {data.dependencies.database.version}</p>
        <p>Conexões abertas: {data.dependencies.database.opened_connections}</p>
        <p>Conexões disponíveis: {data.dependencies.database.max_connections}</p>
      </div>
    </div>
  );
}
