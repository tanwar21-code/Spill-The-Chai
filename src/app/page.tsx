
import { Header } from '@/components/layout/header'
import { Feed } from '@/components/confession/feed'
import { CreateConfessionModal } from '@/components/confession/create-confession-modal'
import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <React.Suspense fallback={<div className="h-16 border-b" />}>
        <Header />
      </React.Suspense>
      
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-10">
        <section className="mb-8 flex flex-col items-center justify-center space-y-6 text-center">
           <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                   Anonymous Confessions
               </h1>
               <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                   Share your deepest secrets, funny thoughts, or college gossip with the safety of anonymity. 
               </p>
           </div>
           
           <CreateConfessionModal />
        </section>

        <section className="w-full">
            <React.Suspense fallback={<div>Loading feed...</div>}>
                <Feed />
            </React.Suspense>
        </section>
      </main>

      <footer className="py-6 border-t text-center text-sm text-muted-foreground bg-muted/30">
        <p>© {new Date().getFullYear()} Spill The Chai. Brewed with ❤️ by AI.</p>
      </footer>
    </div>
  );
}
