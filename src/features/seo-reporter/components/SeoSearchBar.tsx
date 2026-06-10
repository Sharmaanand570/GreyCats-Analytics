import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

interface SeoSearchBarProps {
  onSearch: (url: string) => void;
  loading: boolean;
}

export const SeoSearchBar: React.FC<SeoSearchBarProps> = ({ onSearch, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-2xl items-center group mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <Input
        type="url"
        placeholder="Enter website URL (e.g. https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full pl-12 pr-36 py-6 h-16 text-lg bg-white/80 backdrop-blur-md border-zinc-200/80 rounded-2xl shadow-sm hover:border-indigo-300 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-300"
        disabled={loading}
        required
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <Button 
          type="submit" 
          disabled={loading || !url.trim()}
          className="h-12 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all duration-300 shadow-md shadow-zinc-900/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              <span>Analyzing</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
