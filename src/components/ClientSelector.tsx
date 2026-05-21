import * as React from "react"
import { Check, ChevronsUpDown, Plus, LayoutGrid, Users, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileImageUrl } from "@/utils/imageUtils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useNavigate, useParams } from "react-router-dom"
import { useClients } from "@/hooks/useClients"
import { Button } from "@/components/ui/button"
import { useClientContext } from "@/context/ClientContext"

export function ClientSelector({ isCollapsed }: { isCollapsed?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()
    const { clientId } = useParams<{ clientId: string }>()
    const { data: clients, isError, refetch } = useClients()
    const { currentClient, setCurrentClient } = useClientContext()

    // Keep context in sync with the URL. ClientProvider sits above <Routes>, so its
    // own useParams() never resolves :clientId — without this sync, currentClient
    // goes stale the moment the user navigates between routes that have / don't
    // have a :clientId segment, and the sidebar visibly swaps clients on tab change.
    React.useEffect(() => {
        if (!clientId || !clients) return;
        const client = clients.find(c => c.id === Number(clientId));
        if (client && currentClient?.id !== client.id) {
            setCurrentClient(client);
            localStorage.setItem('lastClientId', String(client.id));
        }
    }, [clientId, clients, currentClient?.id, setCurrentClient]);

    const selectedClient = React.useMemo(() => {
        // Prefer URL param match, fall back to global context client
        const fromUrl = clients?.find(c => c.id === Number(clientId));
        return fromUrl || currentClient || null;
    }, [clients, clientId, currentClient]);

    const handleSelectClient = (id: number) => {
        const client = clients?.find(c => c.id === id)
        if (client) {
            setCurrentClient(client)
            localStorage.setItem('lastClientId', String(id))
        }
        navigate(`/clients/${id}`)
        setOpen(false)
    }

    const handleSelectOverview = () => {
        setCurrentClient(null)
        localStorage.removeItem('lastClientId')
        navigate(`/clients`)
        setOpen(false)
    }

    if (isCollapsed) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-full bg-zinc-800 hover:bg-zinc-700">
                        {selectedClient ? (
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={getProfileImageUrl(selectedClient.logo)} className="object-contain" />
                                <AvatarFallback className="bg-transparent font-bold text-[10px] text-white">
                                    {selectedClient.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <LayoutGrid className="h-4 w-4 text-zinc-400" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 ml-2 bg-zinc-950 border-zinc-800" side="right" align="start">
                    <Command className="bg-zinc-950">
                        <CommandInput placeholder="Search client..." className="text-zinc-100 placeholder:text-zinc-500" />
                        <CommandList>
                            {isError ? (
                                <CommandItem onSelect={() => refetch()} className="cursor-pointer text-red-500 data-[selected=true]:bg-zinc-800">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Failed to load. Click to retry.
                                </CommandItem>
                            ) : (
                                <CommandEmpty className="py-6 text-center text-sm text-zinc-500">No client found.</CommandEmpty>
                            )}
                            <CommandGroup heading="Suggestions" className="text-zinc-400">
                                <CommandItem onSelect={handleSelectOverview} className="cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50">
                                    <Users className="mr-2 h-4 w-4" />
                                    All Clients
                                    {!selectedClient && <Check className="ml-auto h-4 w-4" />}
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator className="bg-zinc-800" />
                            <CommandGroup heading="Clients" className="text-zinc-400">
                                {clients?.map((client) => (
                                    <CommandItem
                                        key={client.id}
                                        onSelect={() => handleSelectClient(client.id)}
                                        className="cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Avatar className="h-6 w-6 rounded-full border border-zinc-700">
                                                <AvatarImage src={getProfileImageUrl(client.logo)} className="object-contain" />
                                                <AvatarFallback className="bg-zinc-800 text-[10px] font-bold text-zinc-300">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{client.name}</span>
                                        </div>
                                        {selectedClient?.id === client.id && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-9 text-xs px-3 justify-between bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedClient ? (
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={getProfileImageUrl(selectedClient.logo)} className="object-contain" />
                                <AvatarFallback className="bg-primary text-[9px] font-bold text-primary-foreground">
                                    {selectedClient.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <LayoutGrid className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        <span className="truncate">
                            {selectedClient ? selectedClient.name : "Select Client..."}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-950 border-zinc-800" align="start">
                <Command className="bg-zinc-950">
                    <CommandInput placeholder="Search client..." className="text-zinc-100 placeholder:text-zinc-500" />
                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {isError ? (
                            <CommandItem onSelect={() => refetch()} className="cursor-pointer text-red-500 data-[selected=true]:bg-zinc-800">
                                <Activity className="mr-2 h-4 w-4" />
                                Failed to load. Click to retry.
                            </CommandItem>
                        ) : (
                            <CommandEmpty className="py-6 text-center text-sm text-zinc-500">No client found.</CommandEmpty>
                        )}
                        <CommandGroup className="text-zinc-400">
                            <CommandItem onSelect={handleSelectOverview} className="cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50">
                                <Users className="mr-2 h-4 w-4" />
                                All Clients / Overview
                                {!selectedClient && <Check className="ml-auto h-4 w-4" />}
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator className="bg-zinc-800" />
                        <CommandGroup heading="Clients" className="text-zinc-400">
                            {clients?.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    onSelect={() => handleSelectClient(client.id)}
                                    className="cursor-pointer text-zinc-100 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-50"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <Avatar className="h-6 w-6 rounded-full border border-zinc-700">
                                            <AvatarImage src={getProfileImageUrl(client.logo)} className="object-contain" />
                                            <AvatarFallback className="bg-zinc-800 text-[10px] font-bold text-zinc-300">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{client.name}</span>
                                    </div>
                                    {selectedClient?.id === client.id && (
                                        <Check className="ml-auto h-4 w-4" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-zinc-800" />
                        <CommandGroup>
                            <CommandItem onSelect={() => {
                                navigate('/clients');
                                setOpen(false);
                            }} className="cursor-pointer text-zinc-400 data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-200">
                                <Plus className="mr-2 h-4 w-4" />
                                Manage Clients
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
