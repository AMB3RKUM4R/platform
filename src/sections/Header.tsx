// src/sections/Header.tsx
import React, { useState, useEffect } from 'react'
import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import LeaderboardsModal from '../sections/LeaderBoard/LeaderboardsModal'
import { PLATFORM_JACKPOT_FEE, PLATFORM_CREATOR_ADDRESS } from '../constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { ENABLE_LEADERBOARD } from '../constants'

// Firebase imports
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  AuthProvider,
  User,
} from 'firebase/auth'
import {
  auth,
  googleProvider,
  facebookProvider,
  twitterProvider,
  githubProvider,
  microsoftProvider,
} from '../lib/firebase' // adjust path as needed

const Bonus = styled.button`
  all: unset;
  cursor: pointer;
  color: #ffe42d;
  border-radius: 10px;
  padding: 2px 10px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
  transition: background-color 0.2s;
  &:hover {
    background: white;
  }
`

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background: #000000cc;
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
`

const Logo = styled(NavLink)`
  height: 24px;
  margin: 0 10px;
  & > img {
    height: 120%;
  }
`

export default function Header() {
  // Original hooks
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const isDesktop = useMediaQuery('lg')
  const [showLeaderboard, setShowLeaderboard] = React.useState(false)
  const [bonusHelp, setBonusHelp] = React.useState(false)
  const [jackpotHelp, setJackpotHelp] = React.useState(false)

  // Firebase Auth State & UI modal
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setError(null)
    })
    return () => unsubscribe()
  }, [])

  // Firebase Auth handlers
  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSignInWithProvider = async (provider: AuthProvider) => {
    try {
      await signInWithPopup(auth, provider)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setError(null)
      setUser(null)
      setShowLoginModal(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      {/* Modals for Bonus and Jackpot help */}
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have <b><TokenValue amount={balance.bonusBalance} /></b> worth of free plays.
            This bonus will be applied automatically when you play.
          </p>
          <p>Note that a fee is still needed from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p style={{ fontWeight: 'bold' }}>
            There's <TokenValue amount={pool.jackpotBalance} /> in the Jackpot.
          </p>
          <p>
            The Jackpot is a prize pool that grows with every bet made. As it grows, so does your chance of winning. Once a winner is selected, the pool resets and grows again from there.
          </p>
          <p>
            You pay a maximum of {(PLATFORM_JACKPOT_FEE * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}% of each wager for a chance to win.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) =>
                context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)
              }
            />
          </label>
        </Modal>
      )}

      {/* Leaderboard */}
      {ENABLE_LEADERBOARD && showLeaderboard && (
        <LeaderboardsModal
          creator={PLATFORM_CREATOR_ADDRESS.toBase58()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Firebase Login Modal */}
      {showLoginModal && (
        <Modal onClose={() => setShowLoginModal(false)}>
          {!user ? (
            <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
              <h2 style={{ marginBottom: 20 }}>Login to Swytch2</h2>
              {error && (
                <p style={{
                  color: 'red',
                  backgroundColor: '#fee',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  {error}
                </p>
              )}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
                aria-label="Email"
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
                aria-label="Password"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <button
                  onClick={handleEmailSignIn}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    flex: 1,
                    marginRight: 8,
                  }}
                  aria-label="Sign in with email"
                >
                  Sign In
                </button>
                <button
                  onClick={handleEmailSignUp}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                  aria-label="Sign up with email"
                >
                  Sign Up
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleSignInWithProvider(googleProvider)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Sign in with Google"
                >
                  Google
                </button>
                <button
                  onClick={() => handleSignInWithProvider(facebookProvider)}
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Sign in with Facebook"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleSignInWithProvider(twitterProvider)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Sign in with Twitter"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleSignInWithProvider(githubProvider)}
                  style={{
                    backgroundColor: '#111',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Sign in with GitHub"
                >
                  GitHub
                </button>
                <button
                  onClick={() => handleSignInWithProvider(microsoftProvider)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Sign in with Microsoft"
                >
                  Microsoft
                </button>
                <button
                  onClick={handleAnonymousSignIn}
                  style={{
                    backgroundColor: '#64748b',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '12px',
                  }}
                  aria-label="Sign in anonymously"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3>Welcome, {user.email || 'Guest'}!</h3>
              <button
                onClick={handleSignOut}
                style={{
                  marginTop: '20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '24px',
                  padding: '10px 20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          )}
        </Modal>
      )}

      <StyledHeader>
        <Logo to="/">
          <img src="/logo.png" alt="Swytch2 Logo" />
        </Logo>
        <h2>Swytch</h2>

        {isDesktop && (
          <>
            <TokenSelect />
            <Bonus onClick={() => setBonusHelp(true)}>Bonus ✨</Bonus>
            <Bonus onClick={() => setJackpotHelp(true)}>Jackpot 💰</Bonus>
            <GambaUi.Button
  onClick={() => setShowLeaderboard(true)}
  disabled={!ENABLE_LEADERBOARD}

>
  Leaderboard
</GambaUi.Button>
            <UserButton />
          </>
        )}

        {/* New Login Button */}
        <button
          onClick={() => setShowLoginModal(true)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '20px',
            padding: '6px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            border: 'none',
            marginLeft: 'auto',
          }}
          aria-label="Open login modal"
        >
          {user ? 'Account' : 'Login'}
        </button>
      </StyledHeader>
    </>
  )
}
