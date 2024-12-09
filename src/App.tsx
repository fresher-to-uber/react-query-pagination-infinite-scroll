import { useEffect, useState } from 'react'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Input } from './components/ui/input'
import PokemonList from './pokemon-list'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChevronsLeftRight, ArrowDown } from 'lucide-react'
import InfiniteScrollPokemonList from './infinite-scroll-pokemon-list'

const queryClient = new QueryClient()

function useDebounce(value: string, delay: number) {
  const [ debounced, setDebounced ] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    }
  }, [value, delay]);

  return debounced;
}

type PagingType = 'default' | 'infinite'

function App() {
  const [ search, setSearch ] = useState('');
  const [ page, setPage ] = useState(1);
  const [ pagingType, setPagingType ] = useState<PagingType>('default');

  const debouncedSearch = useDebounce(search, 500);

  const searchHandle = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const onPagingTypeChange = (value: PagingType) => {
    setSearch('')
    setPage(1)
    setPagingType(value)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <div className="container flex flex-col gap-4 mx-auto items-center">
        <Input type="text" placeholder="Search pokemon" value={search} onChange={(e) => searchHandle(e.target.value)} />
        <div className='flex gap-2 items-center'>
          <span>Pagination</span>
          <ToggleGroup type="single"
            value={pagingType}
            onValueChange={(value: PagingType) => onPagingTypeChange(value)}
            className="rounded-full w-fit border border-solid border-gray-400 p-1"
          >
            <ToggleGroupItem value="default" aria-label="Toggle light" className="border-0 rounded-full size-8 p-0 text-muted-foreground hover:text-accent-foreground">
              <ChevronsLeftRight className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="infinite" aria-label="Toggle system" className="border-0 rounded-full size-8 p-0 text-muted-foreground hover:text-accent-foreground">
              <ArrowDown className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <span>Infinite Scroll</span>
        </div>
        
        {pagingType === 'default' ? 
          <PokemonList search={debouncedSearch} page={page} setPage={setPage} /> : 
          <InfiniteScrollPokemonList search={debouncedSearch} />
        }
      </div>
    </QueryClientProvider>
  )
}

export default App
