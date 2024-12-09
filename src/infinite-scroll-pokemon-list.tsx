import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPokemonsFromGraphql } from "./api";
import { LoaderCircle } from "lucide-react";
import PokemonCard from "./pokemon-card";
import { useIntersectionObserver } from "@uidotdev/usehooks";

function usePokemons(search: string) {
  return useInfiniteQuery({
    queryKey: ['pokemons-infinite-scroll', search],
    queryFn: ({ pageParam }) => fetchPokemonsFromGraphql(search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.totalPages === allPages.length) {
        return undefined
      }
      return lastPageParam + 1
    },
    enabled: !!search,
  })
}

function InfiniteScrollPokemonList({
  search,
}: { 
  search: string,
}) {
  const [ref, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });
  const { data, status, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } = usePokemons(search);

  React.useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      console.log("fetching new page...")
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage])

  
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
    const pokemons = data.pages.map(p => p.data).flat();
    return (
      <>
      <div className="flex flex-col gap-2 items-center">
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {pokemons.map((pokemon) => {
            return (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            )
          })}
        </div>
        {isFetchingNextPage && (<div className="flex justify-center">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {hasNextPage && <div className="h-1" ref={ref} />}
      </>
    )
  }

  return (
    <div>
      No Pokemons founded!
    </div>
  )
}

export default InfiniteScrollPokemonList;
