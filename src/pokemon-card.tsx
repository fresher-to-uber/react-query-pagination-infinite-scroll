import { PokemonInfo } from "./api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge, badgeVariants } from "./components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function PokemonCard({
  pokemon,
  isPlaceholderData
}: {
  pokemon: PokemonInfo,
  isPlaceholderData?: boolean
}) {

  return (
    <div>
      {isPlaceholderData ?
      (<Card>
        <CardHeader className="h-28">
          <CardTitle>
            <Skeleton className="w-4/6 rounded-full h-7" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="w-2/6 rounded-full h-6" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-60" />
        </CardContent>
      </Card>)
      :
      (<Card className="">
        <CardHeader className="items-start">
          <CardTitle className="text-xl mb-2">{pokemon.name}</CardTitle>
          <CardDescription className="flex gap-2">
            {pokemon.types?.map(type => {
              return (
                <Badge variant={type as NonNullable<
                  Parameters<typeof badgeVariants>[0]
                >['variant']} key={type}>{type}</Badge>
              )
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
            <div className="flex items-center h-60 mx-auto">
              <img className="object-contain" src={pokemon.image} />
            </div>
        </CardContent>
      </Card>)}
    </div>
  )
}
