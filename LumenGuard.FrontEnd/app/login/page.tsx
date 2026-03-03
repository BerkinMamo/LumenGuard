"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, Lock, User } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        username: email,
        password: password,
      })

      const response = await authApi.login(params)
      
      if (response.data.access_token) {
        localStorage.setItem("lumen_token", response.data.access_token)
        toast.success("Identity Verified. Access Granted.")
        router.push("/") // Dashboard'a yönlendir
      }
    } catch (error) {
      toast.error("Authentication Failed. Invalid credentials or HSM timeout.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1D33] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/icon.svg')] bg-no-repeat bg-center opacity-5 scale-150 pointer-events-none" />
      
      <Card className="w-full max-w-md border-[#00D2FF]/20 bg-[#0B1D33]/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#00D2FF]/10 rounded-full flex items-center justify-center mb-4 border border-[#00D2FF]/30">
            <ShieldCheck className="w-10 h-10 text-[#00D2FF]" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Lumen Guard</CardTitle>
          <CardDescription className="text-gray-400">
            HSM-Backed Identity Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="email" 
                  placeholder="Security Email" 
                  className="pl-10 bg-[#0B1D33] border-gray-700 text-white focus:border-[#00D2FF]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="password" 
                  placeholder="Encryption Key (Password)" 
                  className="pl-10 bg-[#0B1D33] border-gray-700 text-white focus:border-[#00D2FF]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B1D33] font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Decrypting Session..." : "Verify Identity"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}