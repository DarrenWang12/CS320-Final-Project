import { Button } from './ui/button'
import { Music2, BarChart3, Settings } from 'lucide-react'

export function Header() {
    return (
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">MoodTune</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Discover
              </a>
              <a href="/my-moods" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Moods
              </a>
              <a href="/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </a>
            </nav>
  
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                Connect Spotify
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }

export default Header