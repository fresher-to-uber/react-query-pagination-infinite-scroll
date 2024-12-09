export type PokemonsResponse = {
  totalPages: number,
  totalElements: number,
  data: PokemonInfo[]
}

export type PokemonInfo = {
  id: number;
  name: string;
  image: string;
  types: string[];
};

export type PokemonDetail = PokemonInfo & {
  abilities: string[];
  stats: PokemonStat[];
}

export type PokemonStat = {
  name: string;
  value: number;
};

export const DEFAULT_PAGE_SIZE = 10;

export const POKEMON_ARTWORK_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";

export const GRAPHQL_BASE_URL = "https://graphql-pokeapi.graphcdn.app/";

const gqlQuery = `query pokemon($name: String!) {
  pokemon(name: $name) {
    id
    name
    types {
      type {
        name
      }
    }
  }
}`;

export async function fetchPokemonsFromGraphql(search: string, page: number): Promise<PokemonsResponse> {
  const pokemons = await fetch("https://pokeapi.co/api/v2/pokemon-species?limit=10000");
  const json = await pokemons.json();
  let results: any[] = json.results;

  // sleep 2s to see the placeholderData loading
  await new Promise(resolve => setTimeout(resolve, 2000));

  let totalPages = 0;
  let totalElements = 0;
  if (search) {
    results = results
      .filter(({ name }: { name: string }) => name.includes(search))
    totalElements = results.length;
    totalPages = Math.ceil(totalElements / DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * DEFAULT_PAGE_SIZE;
    results = results.slice(offset, offset + DEFAULT_PAGE_SIZE);
  }

  const data = await Promise.all(
    results.map(async ({ name, url }: { name: string, url: string }) => {
      const backupId = url.split('/').filter(Boolean).pop();
      const res = await fetch(GRAPHQL_BASE_URL, {
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: gqlQuery,
          variables: { name: backupId },
        }),
        method: 'POST',
      });
      const { data: { pokemon } } = await res.json();
      return {
        id: pokemon.id || backupId,
        name: pokemon.name || name,
        image: `${POKEMON_ARTWORK_URL}${pokemon.id || backupId}.png`,
        types: pokemon.types?.map(({ type: { name } }: { type: { name: string } }) => name),
      }
    })
  );
  return {
    totalElements,
    totalPages,
    data
  }
}
