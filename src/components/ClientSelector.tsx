import * as React from "react"
import { Check, ChevronsUpDown, Plus, LayoutGrid, Users } from "lucide-react"
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

export function ClientSelector({ isCollapsed }: { isCollapsed?: boolean }) {
    const [open, setOpen] = React.useState(false)
    const navigate = useNavigate()
    const { clientId } = useParams<{ clientId: string }>()
    const { data: clients } = useClients()

    const selectedClient = React.useMemo(() =>
        clients?.find(c => c.id === Number(clientId)),
        [clients, clientId]
    );

    const handleSelectClient = (id: number) => {
        navigate(`/clients/${id}`)
        setOpen(false)
    }

    const handleSelectOverview = () => {
        navigate(`/clients`)
        setOpen(false)
    }

    if (isCollapsed) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-full bg-zinc-800 hover:bg-zinc-700">
                        {selectedClient ? (
                            <span className="font-bold text-sm text-white">{selectedClient.name.substring(0, 2).toUpperCase()}</span>
                        ) : (
                            <LayoutGrid className="h-5 w-5 text-zinc-400" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 ml-2 bg-zinc-950 border-zinc-800" side="right" align="start">
                    <Command className="bg-zinc-950">
                        <CommandInput placeholder="Search client..." className="text-zinc-100 placeholder:text-zinc-500" />
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-zinc-500">No client found.</CommandEmpty>
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
                                            <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
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
                    className="w-full justify-between bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                >
                    <div className="flex items-center gap-2 truncate">
                        {selectedClient ? (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                                {selectedClient.name.substring(0, 2).toUpperCase()}
                            </div>
                        ) : (
                            <LayoutGrid className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className="truncate">
                            {selectedClient ? selectedClient.name : "Select Client..."}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-950 border-zinc-800" align="start">
                <Command className="bg-zinc-950">
                    <CommandInput placeholder="Search client..." className="text-zinc-100 placeholder:text-zinc-500" />
                    <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        <CommandEmpty className="py-6 text-center text-sm text-zinc-500">No client found.</CommandEmpty>
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
                                        <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
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
