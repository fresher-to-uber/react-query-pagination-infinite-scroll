import { useQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { fetchPokemonsFromGraphql } from "./api";
import { LoaderCircle } from "lucide-react";
import PokemonCard from "./pokemon-card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "./components/ui/pagination";
import React from "react";

function fetchPokemonsOptions(search: string, page: number) {
  return queryOptions({
    queryKey: ['pokemons', { search, page }],
    queryFn: () => fetchPokemonsFromGraphql(search, page),
    enabled: !!search,
  })
}

function usePokemonsWithPrefetch(search: string, page: number) {
  const queryClient = useQueryClient()

  // prefetch next page
  React.useEffect(() => {
    queryClient.prefetchQuery(fetchPokemonsOptions(search, page + 1))
  }, [search, page, queryClient])
  
  return useQuery({
    ...fetchPokemonsOptions(search, page),
    placeholderData: (previousData) => previousData
  })
}

function usePokemonsWithPlaceholder(search: string, page: number) {  
  return useQuery({
    ...fetchPokemonsOptions(search, page),
    placeholderData: (previousData) => {
      return search ? previousData : undefined
    }
  })
}

function PokemonList({
  search,
  page,
  setPage
}: { 
  search: string,
  page: number,
  setPage: (page: number | ((page: number) => number)) => void,
}) {
  const { data, status, isLoading, isPlaceholderData } = usePokemonsWithPlaceholder(search, page);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex justify-center">
        Error
      </div>
    )
  }

  if (status === "success") {
    const { totalPages, data: listData } = data;
    return (
      <div className="flex flex-col gap-2 items-center w-full">
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {listData.length > 0 ? listData.map((pokemon) => {
            return (
              <PokemonCard key={pokemon.id} pokemon={pokemon} isPlaceholderData={isPlaceholderData} />
            )
          }) : (<div className="col-span-5">No pokemons found!</div>)}
        </div>
        {data && (
          <Paginator currentPage={page} totalPages={totalPages} setPage={setPage} isFetching={isPlaceholderData} />
        )}
      </div>
    )
  }

  return (
    <div>
      Try to search pokemon!
    </div>
  )
}

export default PokemonList;

function Paginator({ currentPage, totalPages, isFetching, setPage }: {
  currentPage: number,
  totalPages: number,
  isFetching: boolean,
  setPage: (page: number | ((page: number) => number)) => void
}) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem className="hover:cursor-pointer">
          <PaginationPrevious onClick={() => setPage(p => p - 1)}
            disabled={currentPage === 1 || isFetching}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
          return (
            <PaginationItem key={p} className="hover:cursor-pointer">
              <PaginationLink isActive={p === currentPage} onClick={() => setPage(p)} disabled={isFetching}>{p}</PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem className="hover:cursor-pointer">
          <PaginationNext onClick={() => setPage(p => p + 1)} 
            disabled={currentPage === totalPages || isFetching}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}