import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Zap, RefreshCw, Trophy, Layers } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { triggerConfetti } from '../../utils/confetti'
import { audioFX } from '../../utils/audioFX'

const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function TokenTower() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [vocabulary, setVocabulary] = useState([])
  const [gameVocab, setGameVocab] = useState([])
  const [level, setLevel] = useState(null)
  
  // Game State
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  
  // Round State
  const [currentWord, setCurrentWord] = useState(null)
  const [tokens, setTokens] = useState([])
  const [tower, setTower] = useState([]) // Array of correctly stacked tokens
  
  // Physics & Animation
  const containerRef = useRef(null)
  const [tokenY, setTokenY] = useState(0)
  const speedRef = useRef(2)
  const requestRef = useRef()

  useEffect(() => {
    if (user?.learningLanguage) {
      const vocab = getVocabularyForLanguage(user.learningLanguage, 'en')
      setVocabulary(vocab)
    }
  }, [user])

  const startGame = (selectedLevel) => {
    // Filter vocab by level logic (simplified for now, using units or just slices)
    let pool = vocabulary
    if (selectedLevel === 1) pool = vocabulary.slice(0, 15)
    if (selectedLevel === 2) pool = vocabulary.slice(15, 30)
    if (selectedLevel === 3) pool = vocabulary.slice(30)
    if (pool.length < 3) pool = vocabulary // fallback
    
    setGameVocab(pool)
    setLevel(selectedLevel)
    setScore(0)
    setLives(3)
    setTower([])
    setIsPlaying(true)
    setIsGameOver(false)
    speedRef.current = 1.5 + (selectedLevel * 0.5) // Harder levels = faster
    startRound(pool)
  }

  const startRound = (pool) => {
    const shuffled = shuffle(pool)
    const target = shuffled[0]
    const distractors = shuffled.slice(1, 3)
    
    const roundTokens = shuffle([target, ...distractors])
    
    setCurrentWord(target)
    setTokens(roundTokens)
    setTokenY(-100) // Start above screen
  }

  // Animation Loop
  const animate = () => {
    if (!isPlaying) return
    
    setTokenY(prev => {
      const newY = prev + speedRef.current
      // If tokens hit the bottom (approx 600px or container height)
      if (containerRef.current && newY > containerRef.current.clientHeight - 100 - (tower.length * 30)) {
        // Missed!
        handleMiss()
        return -100
      }
      return newY
    })
    
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate)
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying, tower.length])

  const handleMiss = () => {
    cancelAnimationFrame(requestRef.current)
    audioFX.playWrong()
    setLives(l => {
      if (l <= 1) {
        endGame()
        return 0
      }
      setTimeout(() => startRound(gameVocab), 1000)
      return l - 1
    })
  }

  const handleTokenClick = (token) => {
    if (!isPlaying) return
    
    if (token.id === currentWord.id) {
      // Correct match
      audioFX.playCorrect()
      setScore(s => s + 10)
      setTower(prev => [...prev, token.word])
      speedRef.current += 0.1 // Speed up slightly
      cancelAnimationFrame(requestRef.current)
      setTimeout(() => startRound(gameVocab), 300)
    } else {
      // Wrong match
      handleMiss()
    }
  }

  const endGame = () => {
    setIsPlaying(false)
    setIsGameOver(true)
    if (score > 50) triggerConfetti()
  }

  // Level Selection Screen
  if (!level && !isGameOver) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col p-8 font-sans">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/games')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-slate-800">Token Tower</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
            <Layers size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-8">Select Level</h2>
          <div className="flex gap-4">
            {[1, 2, 3].map(lvl => (
              <button 
                key={lvl}
                onClick={() => startGame(lvl)}
                className="w-32 h-32 bg-white border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50 flex flex-col items-center justify-center transition-all"
              >
                <span className="text-4xl font-black text-slate-800 mb-2">{lvl}</span>
                <span className="text-sm font-bold text-slate-500">
                  {lvl === 1 ? 'Basics' : lvl === 2 ? 'Intermediate' : 'Advanced'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col py-6 pb-20 font-sans relative overflow-hidden" ref={containerRef}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 z-10 px-8">
        <button 
          onClick={() => {
            setIsPlaying(false)
            setLevel(null)
          }}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-teal-600 font-black text-xl">
            <Trophy /> {score}
          </div>
          <div className="flex items-center gap-1 text-red-500">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={24} fill={i < lives ? "currentColor" : "none"} strokeWidth={i < lives ? 0 : 2} className={i < lives ? "text-red-500" : "text-slate-300"} />
            ))}
          </div>
        </div>
      </div>

      {isGameOver ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 text-center z-10"
        >
          <h2 className="text-4xl font-black text-slate-800 mb-2">Game Over!</h2>
          <p className="text-slate-500 mb-6">Your Tower Height</p>
          <div className="text-6xl font-black text-teal-500 mb-8 flex items-center gap-2">
            <Layers /> {tower.length}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setLevel(null)}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Change Level
            </button>
            <button 
              onClick={() => startGame(level)}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <RefreshCw size={18} /> Play Again
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 relative flex flex-col items-center">
          {/* Falling Tokens */}
          <motion.div 
            className="absolute top-0 flex gap-4 w-full justify-center px-8"
            style={{ y: tokenY }}
          >
            {tokens.map((token, idx) => (
              <button
                key={token.id + idx}
                onClick={() => handleTokenClick(token)}
                className="px-6 py-4 bg-white border-2 border-slate-200 shadow-xl rounded-xl font-bold text-slate-800 hover:border-teal-500 hover:bg-teal-50 hover:scale-105 transition-transform"
              >
                {token.word}
              </button>
            ))}
          </motion.div>

          {/* Tower Stack */}
          <div className="absolute bottom-24 flex flex-col-reverse items-center justify-end w-full">
            {tower.map((word, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-8 py-3 bg-teal-500 text-white font-black border-b-4 border-teal-700 rounded-lg shadow-lg -mt-2 z-10"
                style={{ width: `${Math.max(120, 200 - (idx * 5))}px`, textAlign: 'center' }}
              >
                {word}
              </motion.div>
            ))}
          </div>

          {/* Base Platform / Target Word */}
          <div className="absolute bottom-4 bg-slate-800 text-white px-12 py-6 rounded-2xl shadow-2xl z-20">
            <span className="text-sm font-bold text-slate-400 block mb-1">CATCH THE TRANSLATION</span>
            <span className="text-3xl font-black">{currentWord?.translation}</span>
          </div>
        </div>
      )}
    </div>
  )
}
