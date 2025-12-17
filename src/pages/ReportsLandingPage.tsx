
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { Building2, FileText } from 'lucide-react';
import { FiSearch, FiBell } from "react-icons/fi";
// import { Button } from '../components/ui/button';
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

const ReportsLandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: clients, isLoading } = useClients();
    const [searchQuery, setSearchQuery] = useState("");

    const handleClientClick = (clientId: number) => {
        navigate(`/clients/${clientId}/reports`);
    };

    const filteredClients = clients?.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
            <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
                <div className="w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="w-full h-[4.8em] border-b flex justify-between items-center px-5 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <span className="font-medium text-xl text-zinc-800">Reports</span>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center border-l pl-4 gap-3">
                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                    <FiBell className="text-lg" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-zinc-900">Select a Client</h2>
                            <p className="text-sm text-gray-500">Choose a client to view their reports.</p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                                ))}
                            </div>
                        ) : clients?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh]">
                                <div className="p-8 rounded-full bg-gray-50 mb-6">
                                    <FileText className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 mb-2">No clients found</h3>
                                <p className="text-gray-500 text-center mb-8 max-w-sm">
                                    You need to have clients to view reports.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredClients?.map((client) => {
                                    return (
                                        <div
                                            key={client.id}
                                            onClick={() => handleClientClick(client.id)}
                                            className="group relative flex flex-col justify-between p-5 h-40 bg-gradient-to-tr from-[#F3F3F3] to-white border border-gray-200/60 rounded-xl hover:border-zinc-300 transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="flex flex-col items-start w-full">
                                                <div className="flex justify-between w-full mb-3">
                                                    <div className="h-10 w-10 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-100 transition-colors">
                                                        <Building2 className="w-5 h-5 text-zinc-700" />
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-lg text-zinc-900 leading-tight line-clamp-2 text-left w-full group-hover:text-black transition-colors">
                                                    {client.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-end w-full mt-2">
                                                <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Reports &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsLandingPage;
