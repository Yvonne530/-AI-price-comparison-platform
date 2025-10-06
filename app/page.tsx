"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  Search,
  Globe,
  ShoppingCart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Star,
  Filter,
  Heart,
  UserIcon,
  LogIn,
  Zap,
  Bot,
  Sparkles,
  DollarSign,
  Plane,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// 扩展的国家标志映射
const countryFlags = {
  US: "🇺🇸",
  CN: "🇨🇳",
  JP: "🇯🇵",
  DE: "🇩🇪",
  UK: "🇬🇧",
  FR: "🇫🇷",
  RU: "🇷🇺",
  IN: "🇮🇳",
  BR: "🇧🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
  KR: "🇰🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  MX: "🇲🇽",
  NL: "🇳🇱",
  SE: "🇸🇪",
  NO: "🇳🇴",
  DK: "🇩🇰",
  FI: "🇫🇮",
  SG: "🇸🇬",
  TH: "🇹🇭",
  MY: "🇲🇾",
  ID: "🇮🇩",
  PH: "🇵🇭",
  VN: "🇻🇳",
  TW: "🇹🇼",
  HK: "🇭🇰",
  AE: "🇦🇪",
  SA: "🇸🇦",
}

// 扩展的国家平台数据库 (20+主流平台)
const countryPlatforms = {
  US: {
    name: "美国",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    platforms: [
      { id: "amazon_us", name: "Amazon", tax: 0.08, rating: 4.8, logo: "🛒", category: "综合" },
      { id: "walmart", name: "Walmart", tax: 0.065, rating: 4.5, logo: "🏪", category: "综合" },
      { id: "ebay_us", name: "eBay", tax: 0.08, rating: 4.3, logo: "🔨", category: "二手" },
      { id: "bestbuy", name: "Best Buy", tax: 0.08, rating: 4.4, logo: "🔌", category: "电子" },
      { id: "target", name: "Target", tax: 0.075, rating: 4.6, logo: "🎯", category: "综合" },
      { id: "costco", name: "Costco", tax: 0.08, rating: 4.7, logo: "🏬", category: "批发" },
      { id: "newegg", name: "Newegg", tax: 0.08, rating: 4.2, logo: "💻", category: "电子" },
    ],
  },
  CN: {
    name: "中国",
    flag: "🇨🇳",
    currency: "CNY",
    symbol: "¥",
    locale: "zh-CN",
    platforms: [
      { id: "taobao", name: "淘宝", tax: 0.13, rating: 4.7, logo: "🛍️", category: "综合" },
      { id: "jd", name: "京东", tax: 0.11, rating: 4.8, logo: "📦", category: "综合" },
      { id: "pinduoduo", name: "拼多多", tax: 0.13, rating: 4.4, logo: "🍎", category: "团购" },
      { id: "tmall", name: "天猫", tax: 0.13, rating: 4.6, logo: "🐱", category: "品牌" },
      { id: "suning", name: "苏宁", tax: 0.13, rating: 4.3, logo: "🏢", category: "电子" },
      { id: "xiaomi", name: "小米商城", tax: 0.13, rating: 4.5, logo: "📱", category: "电子" },
    ],
  },
  JP: {
    name: "日本",
    flag: "🇯🇵",
    currency: "JPY",
    symbol: "¥",
    locale: "ja-JP",
    platforms: [
      { id: "rakuten", name: "楽天", tax: 0.1, rating: 4.5, logo: "🏪", category: "综合" },
      { id: "yahoo_jp", name: "Yahoo!ショッピング", tax: 0.1, rating: 4.4, logo: "🌐", category: "综合" },
      { id: "amazon_jp", name: "Amazon.jp", tax: 0.1, rating: 4.7, logo: "🛒", category: "综合" },
      { id: "mercari", name: "メルカリ", tax: 0.1, rating: 4.2, logo: "📱", category: "二手" },
      { id: "yodobashi", name: "ヨドバシ", tax: 0.1, rating: 4.6, logo: "🔌", category: "电子" },
    ],
  },
  DE: {
    name: "德国",
    flag: "🇩🇪",
    currency: "EUR",
    symbol: "€",
    locale: "de-DE",
    platforms: [
      { id: "amazon_de", name: "Amazon.de", tax: 0.19, rating: 4.6, logo: "🛒", category: "综合" },
      { id: "otto", name: "Otto", tax: 0.19, rating: 4.3, logo: "🏪", category: "综合" },
      { id: "zalando", name: "Zalando", tax: 0.19, rating: 4.4, logo: "👗", category: "时尚" },
      { id: "mediamarkt", name: "MediaMarkt", tax: 0.19, rating: 4.2, logo: "🔌", category: "电子" },
      { id: "saturn", name: "Saturn", tax: 0.19, rating: 4.1, logo: "🪐", category: "电子" },
    ],
  },
  UK: {
    name: "英国",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    locale: "en-GB",
    platforms: [
      { id: "amazon_uk", name: "Amazon.co.uk", tax: 0.2, rating: 4.5, logo: "🛒", category: "综合" },
      { id: "argos", name: "Argos", tax: 0.2, rating: 4.3, logo: "🏪", category: "综合" },
      { id: "currys", name: "Currys", tax: 0.2, rating: 4.1, logo: "💻", category: "电子" },
      { id: "tesco", name: "Tesco", tax: 0.2, rating: 4.4, logo: "🛍️", category: "综合" },
      { id: "johnlewis", name: "John Lewis", tax: 0.2, rating: 4.6, logo: "🏬", category: "百货" },
    ],
  },
  FR: {
    name: "法国",
    flag: "🇫🇷",
    currency: "EUR",
    symbol: "€",
    locale: "fr-FR",
    platforms: [
      { id: "amazon_fr", name: "Amazon.fr", tax: 0.2, rating: 4.4, logo: "🛒", category: "综合" },
      { id: "fnac", name: "Fnac", tax: 0.2, rating: 4.3, logo: "📚", category: "文化" },
      { id: "cdiscount", name: "Cdiscount", tax: 0.2, rating: 4.1, logo: "💿", category: "综合" },
      { id: "darty", name: "Darty", tax: 0.2, rating: 4.2, logo: "🔌", category: "电子" },
    ],
  },
  KR: {
    name: "韩国",
    flag: "🇰🇷",
    currency: "KRW",
    symbol: "₩",
    locale: "ko-KR",
    platforms: [
      { id: "coupang", name: "Coupang", tax: 0.1, rating: 4.6, logo: "📦", category: "综合" },
      { id: "gmarket", name: "Gmarket", tax: 0.1, rating: 4.4, logo: "🏪", category: "综合" },
      { id: "11st", name: "11번가", tax: 0.1, rating: 4.3, logo: "🏬", category: "综合" },
      { id: "interpark", name: "인터파크", tax: 0.1, rating: 4.2, logo: "🎪", category: "综合" },
    ],
  },
  IN: {
    name: "印度",
    flag: "🇮🇳",
    currency: "INR",
    symbol: "₹",
    locale: "hi-IN",
    platforms: [
      { id: "amazon_in", name: "Amazon.in", tax: 0.18, rating: 4.3, logo: "🛒", category: "综合" },
      { id: "flipkart", name: "Flipkart", tax: 0.18, rating: 4.4, logo: "🛍️", category: "综合" },
      { id: "myntra", name: "Myntra", tax: 0.18, rating: 4.2, logo: "👗", category: "时尚" },
      { id: "snapdeal", name: "Snapdeal", tax: 0.18, rating: 4.0, logo: "⚡", category: "综合" },
    ],
  },
  AU: {
    name: "澳大利亚",
    flag: "🇦🇺",
    currency: "AUD",
    symbol: "A$",
    locale: "en-AU",
    platforms: [
      { id: "amazon_au", name: "Amazon.au", tax: 0.1, rating: 4.4, logo: "🛒", category: "综合" },
      { id: "jbhifi", name: "JB Hi-Fi", tax: 0.1, rating: 4.5, logo: "🎵", category: "电子" },
      { id: "harvey", name: "Harvey Norman", tax: 0.1, rating: 4.2, logo: "🏪", category: "电子" },
      { id: "ebay_au", name: "eBay.au", tax: 0.1, rating: 4.3, logo: "🔨", category: "二手" },
    ],
  },
  SG: {
    name: "新加坡",
    flag: "🇸🇬",
    currency: "SGD",
    symbol: "S$",
    locale: "en-SG",
    platforms: [
      { id: "shopee_sg", name: "Shopee", tax: 0.07, rating: 4.5, logo: "🛍️", category: "综合" },
      { id: "lazada_sg", name: "Lazada", tax: 0.07, rating: 4.3, logo: "🏪", category: "综合" },
      { id: "qoo10", name: "Qoo10", tax: 0.07, rating: 4.2, logo: "🎯", category: "综合" },
    ],
  },
}

// 模拟用户数据
const mockUser = {
  id: "user-001",
  email: "user@example.com",
  name: "张三",
  plan: "free",
  freeTrialsUsed: 0,
  maxFreeTrials: 3,
  registeredAt: new Date(),
}

// 实时税费和运费计算器
const calculateRealTimeTaxAndShipping = (
  basePrice: number,
  country: string,
  platform: any,
  weight = 1, // kg
  dimensions: { length: number; width: number; height: number } = { length: 20, width: 15, height: 5 }, // cm
) => {
  const config = countryPlatforms[country]
  if (!config) return { tax: 0, shipping: 0, duties: 0 }

  // 实时税费计算 (基于商品类型和价格)
  let taxRate = platform.tax
  if (basePrice > 1000) taxRate += 0.02 // 奢侈品税
  if (platform.category === "电子") taxRate += 0.01 // 电子产品附加税

  const tax = basePrice * taxRate

  // 实时运费计算 (基于重量、尺寸和距离)
  const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000 // 立方分米
  const volumeWeight = volume * 200 // 体积重量系数
  const chargeableWeight = Math.max(weight, volumeWeight)

  let shippingRate = 0
  switch (country) {
    case "US":
      shippingRate = 8 + chargeableWeight * 2
      break
    case "CN":
      shippingRate = 15 + chargeableWeight * 1.5
      break
    case "JP":
      shippingRate = 600 + chargeableWeight * 100
      break
    case "DE":
      shippingRate = 5 + chargeableWeight * 3
      break
    case "UK":
      shippingRate = 4 + chargeableWeight * 2.5
      break
    default:
      shippingRate = 10 + chargeableWeight * 2
  }

  // 跨境关税计算
  let duties = 0
  if (basePrice > 200) {
    // 超过免税额度
    duties = basePrice * 0.05 // 5% 关税
  }

  return {
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shippingRate * 100) / 100,
    duties: Math.round(duties * 100) / 100,
  }
}

// AI套利商品发现
interface ArbitrageOpportunity {
  product: any
  buyFrom: { country: string; platform: any; price: number }
  sellTo: { country: string; platform: any; price: number }
  profit: number
  profitMargin: number
  risk: "low" | "medium" | "high"
  demand: number
  competition: number
}

const mockArbitrageOpportunities: ArbitrageOpportunity[] = [
  {
    product: {
      id: "arb-001",
      name: "Apple AirPods Pro 2代",
      image: "/placeholder.svg?height=200&width=200&text=AirPods+Pro",
      category: "音频设备",
    },
    buyFrom: { country: "US", platform: { name: "Amazon US", logo: "🛒" }, price: 199 },
    sellTo: { country: "CN", platform: { name: "淘宝", logo: "🛍️" }, price: 1899 },
    profit: 89.5,
    profitMargin: 0.45,
    risk: "low",
    demand: 95,
    competition: 65,
  },
  {
    product: {
      id: "arb-002",
      name: "Nintendo Switch OLED",
      image: "/placeholder.svg?height=200&width=200&text=Switch+OLED",
      category: "游戏设备",
    },
    buyFrom: { country: "JP", platform: { name: "楽天", logo: "🏪" }, price: 32980 },
    sellTo: { country: "DE", platform: { name: "Amazon.de", logo: "🛒" }, price: 349 },
    profit: 67.3,
    profitMargin: 0.24,
    risk: "medium",
    demand: 88,
    competition: 72,
  },
  {
    product: {
      id: "arb-003",
      name: "Dyson V15 Detect",
      image: "/placeholder.svg?height=200&width=200&text=Dyson+V15",
      category: "家电",
    },
    buyFrom: { country: "UK", platform: { name: "Argos", logo: "🏪" }, price: 449 },
    sellTo: { country: "AU", platform: { name: "JB Hi-Fi", logo: "🎵" }, price: 899 },
    profit: 156.8,
    profitMargin: 0.35,
    risk: "high",
    demand: 76,
    competition: 45,
  },
]

// 扩展的商品数据
const mockProducts = [
  {
    id: "prod-iphone15",
    name: "iPhone 15 Pro 256GB",
    description: "Apple A17 Pro芯片, 6.1英寸OLED显示屏, 钛金属设计",
    image: "/placeholder.svg?height=300&width=300&text=iPhone+15+Pro",
    category: "智能手机",
    brand: "Apple",
    rating: 4.8,
    reviews: 12847,
    weight: 0.187, // kg
    dimensions: { length: 14.7, width: 7.1, height: 0.8 },
    basePrice: 1199,
    prices: {
      amazon_us: { base: 1199, stock: true },
      walmart: { base: 1189, stock: true },
      bestbuy: { base: 1199, stock: true },
      costco: { base: 1179, stock: true },
      taobao: { base: 8999, stock: true },
      jd: { base: 8799, stock: true },
      tmall: { base: 8999, stock: true },
      xiaomi: { base: 8899, stock: false },
      rakuten: { base: 179800, stock: true },
      amazon_jp: { base: 179800, stock: true },
      yodobashi: { base: 179800, stock: true },
      amazon_de: { base: 1329, stock: true },
      otto: { base: 1349, stock: true },
      amazon_uk: { base: 1199, stock: true },
      johnlewis: { base: 1199, stock: true },
      amazon_fr: { base: 1329, stock: true },
      fnac: { base: 1349, stock: true },
      coupang: { base: 1590000, stock: true },
      gmarket: { base: 1599000, stock: true },
      amazon_in: { base: 99900, stock: true },
      flipkart: { base: 98900, stock: true },
      amazon_au: { base: 1849, stock: true },
      jbhifi: { base: 1899, stock: true },
    },
    links: {
      amazon_us: "https://amazon.com/iphone15pro",
      taobao: "https://taobao.com/item/iphone15",
      jd: "https://jd.com/iphone15pro",
    },
    priceHistory: [
      { date: "2024-01-01", price: 1299 },
      { date: "2024-01-15", price: 1249 },
      { date: "2024-02-01", price: 1199 },
    ],
  },
  // 更多商品...
]

// 汇率数据
const exchangeRates = {
  US: 1,
  CN: 7.25,
  JP: 148.5,
  DE: 0.93,
  UK: 0.79,
  FR: 0.93,
  CA: 1.35,
  AU: 1.52,
  KR: 1320,
  IN: 83.2,
  BR: 5.1,
  SG: 1.35,
}

// 用户注册/登录组件
function AuthDialog({ user, onLogin }: { user: any | null; onLogin: (user: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟注册/登录
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      plan: "registered",
      freeTrialsUsed: 0,
      maxFreeTrials: 10, // 注册用户有更多免费试用
      registeredAt: new Date(),
    }
    onLogin(newUser)
    setIsOpen(false)
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{user.name}</span>
          <Badge variant={user.plan === "free" ? "secondary" : "default"} className="text-xs">
            {user.plan === "free" ? "免费" : user.plan === "registered" ? "已注册" : "专业版"}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">
          免费试用: {user.freeTrialsUsed}/{user.maxFreeTrials}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <LogIn className="w-4 h-4" />
          登录/注册
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? "登录账户" : "注册账户"}</DialogTitle>
        </DialogHeader>
        <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                登录
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="text" placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                注册并解锁全球比价
              </Button>
              <p className="text-xs text-gray-500 text-center">
                注册即可解锁全球所有国家和平台，获得10次免费AI套利分析
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// AI套利机会组件
function ArbitrageOpportunities({ user, onTrialUse }: { user: any | null; onTrialUse: () => void }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])

  const canUseFeature = user && (user.plan !== "free" || user.freeTrialsUsed < user.maxFreeTrials)

  const analyzeOpportunities = async () => {
    if (!canUseFeature) return

    setIsAnalyzing(true)
    // 模拟AI分析过程
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setOpportunities(mockArbitrageOpportunities)
    setIsAnalyzing(false)

    if (user && user.plan === "free") {
      onTrialUse()
    }
  }

  return (
    <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI套利机会发现
              </h3>
              <p className="text-gray-600 text-sm">LLM+爬虫联合分析，发现跨境低买高卖机会</p>
            </div>
          </div>
          <Button
            onClick={analyzeOpportunities}
            disabled={!canUseFeature || isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                AI分析中...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                发现套利机会
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {!canUseFeature && (
        <CardContent>
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="font-semibold mb-2">解锁AI套利分析</h4>
            <p className="text-gray-600 mb-4">
              {user ? `您已用完 ${user.maxFreeTrials} 次免费试用，升级获得无限使用` : "注册账户即可获得免费试用机会"}
            </p>
          </div>
        </CardContent>
      )}

      {isAnalyzing && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-sm">正在分析全球价格数据...</span>
            </div>
            <Progress value={33} className="h-2" />
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-pink-600 animate-pulse" />
              <span className="text-sm">识别套利机会...</span>
            </div>
            <Progress value={66} className="h-2" />
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 animate-pulse" />
              <span className="text-sm">计算利润潜力...</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
      )}

      {opportunities.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              发现 {opportunities.length} 个套利机会
            </h4>

            {opportunities.map((opp, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <img
                    src={opp.product.image || "/placeholder.svg"}
                    alt={opp.product.name}
                    className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2"
                  />

                  <div className="flex-1">
                    <h5 className="font-semibold mb-2">{opp.product.name}</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span>{countryFlags[opp.buyFrom.country]}</span>
                          <span>{opp.buyFrom.platform.logo}</span>
                        </div>
                        <div>
                          <div className="text-gray-500">买入价</div>
                          <div className="font-bold text-green-600">${opp.buyFrom.price}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-gray-500">运输到</div>
                          <div className="flex items-center gap-1">
                            <span>{countryFlags[opp.sellTo.country]}</span>
                            <span>{opp.sellTo.platform.logo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-gray-500">预期利润</div>
                          <div className="font-bold text-purple-600">
                            ${opp.profit} ({(opp.profitMargin * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <Badge
                        variant={opp.risk === "low" ? "default" : opp.risk === "medium" ? "secondary" : "destructive"}
                      >
                        {opp.risk === "low" ? "低风险" : opp.risk === "medium" ? "中风险" : "高风险"}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>需求: {opp.demand}%</span>
                        <span>竞争: {opp.competition}%</span>
                      </div>
                      <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                        查看详情
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// 货币格式化函数
function formatCurrency(amount: number, currency: string, symbol: string) {
  const decimals = currency === "JPY" || currency === "KRW" ? 0 : 2
  return `${symbol}${amount.toFixed(decimals)}`
}

// 国家标签组件
function CountryChip({
  code,
  selected,
  onClick,
  disabled = false,
}: {
  code: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  const config = countryPlatforms[code]
  if (!config) return null

  return (
    <button
      className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-all ${
        disabled
          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          : selected
            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="mr-2 text-lg">{config.flag}</span>
      <span className="font-medium">{config.name}</span>
      {disabled && <Lock className="ml-2 w-3 h-3" />}
    </button>
  )
}

// 全球搜索头组件
function GlobalSearchHeader({
  onSearch,
  countries,
  selectedCountries,
  onCountryChange,
  searchQuery,
  user,
}: {
  onSearch: (query: string) => void
  countries: string[]
  selectedCountries: string[]
  onCountryChange: (countries: string[]) => void
  searchQuery: string
  user: any | null
}) {
  const freeCountries = countries.slice(0, 5) // 免费版限制
  const registeredCountries = countries.slice(0, 15) // 注册用户限制
  const allCountries = countries

  const availableCountries =
    user?.plan === "free" ? freeCountries : user?.plan === "registered" ? registeredCountries : allCountries

  const maxSelection = user?.plan === "free" ? 3 : user?.plan === "registered" ? 8 : 20

  return (
    <div className="mb-10">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              全球500+平台比价引擎
            </h1>
            <p className="text-gray-600 mt-1">智能搜索 · 精准比价 · AI套利分析</p>
          </div>
        </div>
      </div>

      {/* 智能搜索栏 */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="搜索商品 (支持中/英/日/法/德/西等20+语言)"
          className="pl-12 pr-4 py-4 text-lg border-2 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        {searchQuery && (
          <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={() => onSearch("")}>
            ✕
          </Button>
        )}
      </div>

      {/* 国家选择器 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            选择比价国家/地区:
          </h2>
          <div className="text-sm text-gray-500">
            已选 {selectedCountries.length}/{maxSelection} 个国家
            {user?.plan === "free" && " | 注册解锁更多国家"}
          </div>
        </div>

        <div className="space-y-4">
          {/* 可用国家 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-green-500" />
              {user?.plan === "free" ? "免费版国家" : user?.plan === "registered" ? "已注册用户" : "全部国家"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {availableCountries.map((country) => (
                <CountryChip
                  key={country}
                  code={country}
                  selected={selectedCountries.includes(country)}
                  onClick={() => {
                    if (selectedCountries.includes(country)) {
                      onCountryChange(selectedCountries.filter((c) => c !== country))
                    } else if (selectedCountries.length < maxSelection) {
                      onCountryChange([...selectedCountries, country])
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* 锁定的国家 */}
          {availableCountries.length < countries.length && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                {user?.plan === "free" ? "注册解锁" : "专业版解锁"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {countries.slice(availableCountries.length, availableCountries.length + 8).map((country) => (
                  <CountryChip key={country} code={country} selected={false} onClick={() => {}} disabled={true} />
                ))}
                <div className="flex items-center px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                  +{countries.length - availableCountries.length - 8} 更多国家...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 产品价格矩阵组件 (更新版)
function ProductPriceMatrix({
  product,
  selectedCountries,
  calculatePrice,
}: {
  product: any
  selectedCountries: string[]
  calculatePrice: (product: any, platformId: string, country: string) => any
}) {
  const [expanded, setExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<"price" | "rating" | "country">("price")

  // 获取最佳价格
  const getBestPrice = (country: string) => {
    const config = countryPlatforms[country]
    if (!config) return { platform: null, value: Number.POSITIVE_INFINITY, currency: "USD", symbol: "$" }

    return config.platforms.reduce(
      (min, platform) => {
        if (!product.prices[platform.id]) return min
        const price = calculatePrice(product, platform.id, country)
        return price.total < min.value
          ? {
              platform,
              value: price.total,
              currency: config.currency,
              symbol: config.symbol,
            }
          : min
      },
      { platform: null, value: Number.POSITIVE_INFINITY, currency: config.currency, symbol: config.symbol },
    )
  }

  // 获取所有价格数据用于排序
  const allPrices = selectedCountries.flatMap((country) => {
    const config = countryPlatforms[country]
    if (!config) return []

    return config.platforms
      .filter((platform) => product.prices[platform.id])
      .map((platform) => ({
        country,
        platform,
        price: calculatePrice(product, platform.id, country),
        config,
      }))
  })

  // 排序逻辑
  const sortedPrices = [...allPrices].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price.total - b.price.total
      case "rating":
        return b.platform.rating - a.platform.rating
      case "country":
        return a.country.localeCompare(b.country)
      default:
        return 0
    }
  })

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* 商品摘要 */}
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-24 h-24 object-contain bg-gray-50 rounded-lg p-2"
            />
            {!product.prices[Object.keys(product.prices)[0]]?.stock && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs">
                缺货
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {product.rating}
                  </span>
                  <span>{product.reviews.toLocaleString()} 评价</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>

            {/* 国家价格摘要 */}
            <div className="mt-4 flex flex-wrap gap-3">
              {selectedCountries.map((country) => {
                const best = getBestPrice(country)
                return best.platform ? (
                  <div key={country} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-lg">{countryPlatforms[country]?.flag}</span>
                    <div className="text-sm">
                      <div className="font-bold text-green-600">
                        {formatCurrency(best.value, best.currency, best.symbol)}
                      </div>
                      <div className="text-gray-500 text-xs">{best.platform.name}</div>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 详细价格矩阵 */}
      {expanded && (
        <CardContent className="border-t bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              详细价格对比 ({sortedPrices.length} 个平台)
            </h4>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">按价格</SelectItem>
                <SelectItem value="rating">按评分</SelectItem>
                <SelectItem value="country">按国家</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    国家/平台
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品价格
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    实时运费
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    实时税费
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    关税
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总价
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPrices.map(({ country, platform, price, config }, index) => (
                  <tr key={`${country}-${platform.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{config.flag}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{platform.logo}</span>
                          <div>
                            <div className="font-medium text-sm">{platform.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {platform.rating}
                              <Badge variant="outline" className="ml-1 text-xs">
                                {platform.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(price.base, config.currency, config.symbol)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(price.shipping, config.currency, config.symbol)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(price.tax, config.currency, config.symbol)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(price.duties, config.currency, config.symbol)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-lg text-green-600">
                        {formatCurrency(price.total, config.currency, config.symbol)}
                      </div>
                      {index === 0 && (
                        <Badge variant="default" className="mt-1 text-xs">
                          最低价
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(product.links?.[platform.id] || "#", "_blank")}
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          直达
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          <Heart className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// 搜索结果组件
function SearchResults({
  products,
  selectedCountries,
  calculatePrice,
}: {
  products: any[]
  selectedCountries: string[]
  calculatePrice: (product: any, platformId: string, country: string) => any
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">
          <Search className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到匹配商品</h3>
        <p className="text-gray-600 mb-6">请尝试其他搜索关键词或选择更多国家</p>
        <Button variant="outline" onClick={() => window.open("https://www.google.com/search", "_blank")}>
          <ExternalLink className="w-4 h-4 mr-2" />
          尝试全网搜索
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">找到 {products.length} 个商品</h2>
        <div className="text-sm text-gray-500">正在比较 {selectedCountries.length} 个国家的价格</div>
      </div>

      {products.map((product) => (
        <ProductPriceMatrix
          key={product.id}
          product={product}
          selectedCountries={selectedCountries}
          calculatePrice={calculatePrice}
        />
      ))}
    </div>
  )
}

// 主应用组件
export default function GlobalPriceFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountries, setSelectedCountries] = useState(["US", "CN", "JP"])
  const [user, setUser] = useState<any | null>(null)

  // 实时价格计算引擎 (升级版)
  const calculateFinalPrice = (product: any, platformId: string, country: string) => {
    const config = countryPlatforms[country]
    if (!config) return { base: 0, shipping: 0, tax: 0, duties: 0, total: 0, currency: "USD", symbol: "$" }

    const platform = config.platforms.find((p) => p.id === platformId)
    if (!platform || !product.prices[platformId]) {
      return { base: 0, shipping: 0, tax: 0, duties: 0, total: 0, currency: config.currency, symbol: config.symbol }
    }

    const basePrice = product.prices[platformId].base

    // 使用实时税费和运费计算
    const realTimeCalc = calculateRealTimeTaxAndShipping(
      basePrice,
      country,
      platform,
      product.weight,
      product.dimensions,
    )

    const total = basePrice + realTimeCalc.shipping + realTimeCalc.tax + realTimeCalc.duties

    return {
      base: basePrice,
      shipping: realTimeCalc.shipping,
      tax: realTimeCalc.tax,
      duties: realTimeCalc.duties,
      total: total,
      currency: config.currency,
      symbol: config.symbol,
    }
  }

  // 搜索过滤
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    return mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const availableCountries = Object.keys(countryPlatforms)

  const handleTrialUse = () => {
    if (user && user.plan === "free") {
      setUser({
        ...user,
        freeTrialsUsed: user.freeTrialsUsed + 1,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600">全球500+平台 · 实时税费计算 · AI套利分析</div>
          </div>
          <AuthDialog user={user} onLogin={setUser} />
        </div>

        {/* 全球搜索头 */}
        <GlobalSearchHeader
          onSearch={setSearchQuery}
          countries={availableCountries}
          selectedCountries={selectedCountries}
          onCountryChange={setSelectedCountries}
          searchQuery={searchQuery}
          user={user}
        />

        {/* AI套利机会发现 */}
        <ArbitrageOpportunities user={user} onTrialUse={handleTrialUse} />

        {/* 主要内容区域 */}
        <div className="mt-8">
          {searchQuery ? (
            <SearchResults
              products={searchResults}
              selectedCountries={selectedCountries}
              calculatePrice={calculateFinalPrice}
            />
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">开始搜索商品</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                在上方搜索框中输入您想要比价的商品名称，我们将为您搜索全球最优价格
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["iPhone 15", "MacBook Air", "AirPods Pro", "iPad Pro", "Nintendo Switch", "Dyson V15"].map((term) => (
                  <Button key={term} variant="outline" onClick={() => setSearchQuery(term)} className="text-sm">
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 页脚信息 */}
        <div className="mt-16 text-center text-sm text-gray-500 space-y-2">
          <p>数据更新于: {new Date().toLocaleDateString("zh-CN")} | 价格仅供参考，以实际购买页面为准</p>
          <p>支持的国家和地区: 美国、中国、日本、德国、英国等 {availableCountries.length} 个国家</p>
          <p className="text-xs">价格包含商品价格、实时税费、运费和关税 | 实际价格可能因促销活动而有所不同</p>
        </div>
      </div>
    </div>
  )
}
