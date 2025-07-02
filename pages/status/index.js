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
      <Dependencies />
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

function Dependencies() {
  const { data, isLoading } = useSWR('/api/v1/status', fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <div>Dependências: Carregando...</div>;
  }

  return (
    <div>
      Dependências:
      <ul>
        {Object.keys(data.dependencies).map((dependency) => (
          <li key={dependency}>
            {dependency}
            <pre>{JSON.stringify(data.dependencies[dependency])}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
