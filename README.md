# git.fun 🚀

> Tokenize your GitHub repositories on Solana via pump.fun

Turn your open-source code into tradable assets. Go from code to token in under 60 seconds.

![git.fun Banner](./docs/banner.png)

## Features

- **🔐 Proof of Ownership**: GitHub OAuth verifies repository ownership
- **⚡ Instant Launch**: No liquidity management - pump.fun handles it all
- **🖼️ IPFS Storage**: Permanent, decentralized metadata storage
- **🛡️ Anti-Spam**: Account age verification prevents abuse
- **📊 One Repo = One Token**: Prevents duplicate tokenization

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Blockchain**: Solana, @solana/web3.js, pump.fun program
- **Auth**: NextAuth.js with GitHub OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: NFT.Storage (IPFS)
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub OAuth application
- NFT.Storage API key
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/git-fun.git
   cd git-fun
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in all required values in `.env.local`

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js encryption key | Yes |
| `NEXTAUTH_URL` | Your app URL | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_NFT_STORAGE_API_KEY` | NFT.Storage API key | Yes |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` or `devnet` | Yes |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Custom RPC endpoint | No |

### Getting API Keys

1. **GitHub OAuth**: [Create OAuth App](https://github.com/settings/developers)
   - Set callback URL to `http://localhost:3000/api/auth/callback/github`

2. **NFT.Storage**: [Get API Key](https://nft.storage) (free)

3. **Solana RPC**: For production, use a dedicated RPC from:
   - [Helius](https://helius.xyz)
   - [QuickNode](https://quicknode.com)
   - [Alchemy](https://alchemy.com)

## Project Structure

```
git-fun/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── api/           # API routes
│   │   ├── auth/          # Auth pages
│   │   ├── docs/          # Documentation page
│   │   ├── explore/       # Browse launched tokens
│   │   └── launch/        # Token launch flow
│   ├── components/        # React components
│   ├── lib/               # Utilities & services
│   │   ├── ipfs.ts        # IPFS upload functions
│   │   ├── prisma.ts      # Database client
│   │   └── pumpfun.ts     # pump.fun integration
│   ├── providers/         # React context providers
│   ├── store/             # Zustand state management
│   └── styles/            # Global CSS
├── .env.example           # Environment template
└── package.json
```

## User Flow

1. **Connect**: User connects GitHub (OAuth) + Solana wallet
2. **Select**: Browse owned repos, pick one to tokenize
3. **Brand**: Set token name, symbol, upload logo
4. **Launch**: Upload to IPFS → Create token on pump.fun
5. **Trade**: Token is live and tradable!

## Security Measures

- **GitHub Admin Check**: Only repos with `permissions.admin === true` can be tokenized
- **Account Age**: GitHub accounts must be 30+ days old
- **Duplicate Prevention**: Each repo can only be tokenized once
- **No Custody**: We never have access to wallet private keys

## Development

```bash
# Run development server
npm run dev

# Run Prisma Studio (database UI)
npm run db:studio

# Generate Prisma client
npm run db:generate

# Build for production
npm run build
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add all environment variables
3. Deploy!

### Self-Hosted

```bash
npm run build
npm start
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | - | NextAuth.js authentication |
| `/api/github/repos` | GET | Fetch user's repositories |
| `/api/github/check-repo` | GET | Check if repo is tokenized |
| `/api/launch` | POST | Record a token launch |
| `/api/launch` | GET | Get all launches |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This software is provided "as is" without warranty of any kind. Cryptocurrency investments carry significant risk. Always do your own research before trading any tokens. The developers are not responsible for any financial losses.

---

Built with ❤️ by developers, for developers.

[Website](https://git.fun) • [Twitter](https://twitter.com/gitfun_) • [GitHub](https://github.com/gitfun)
