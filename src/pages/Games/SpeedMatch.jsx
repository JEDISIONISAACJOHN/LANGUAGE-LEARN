import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Zap, RefreshCw } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { triggerConfetti } from '../../utils/confetti'
import { audioFX } from '../../utils/audioFX'

// Helper to shuffle array
const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function SpeedMatch() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [vocabulary, setVocabulary] = useState([])
  const [gameVocab, setGameVocab] = useState([])
  const [level, setLevel] = useState(null)
  
  const [tiles, setTiles] = useState([])
  const [selectedTiles, setSelectedTiles] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  
  // Initialize game data
  useEffect(() => {
    if (user?.learningLanguage) {
      const vocab = getVocabularyForLanguage(user.learningLanguage, 'en')
      setVocabulary(vocab)
    }
  }, [user])

  const startNewRound = (vocabPool) => {
    // Pick 6 random words
    const shuffledVocab = shuffle(vocabPool)
    const selected = shuffledVocab.slice(0, 6)
    
    // Create 12 tiles (6 words, 6 translations)
    let newTiles = []
    selected.forEach(item => {
      newTiles.push({ id: `word-${item.id}`, type: 'word', text: item.word, matchId: item.id })
      newTiles.push({ id: `trans-${item.id}`, type: 'translation', text: item.translation, matchId: item.id })
    })
    
    setTiles(shuffle(newTiles))
    setMatchedPairs([])
    setSelectedTiles([])
  }

  const startGame = (selectedLevel) => {
    let pool = vocabulary
    if (selectedLevel === 1) pool = vocabulary.slice(0, 15)
    if (selectedLevel === 2) pool = vocabulary.slice(15, 30)
    if (selectedLevel === 3) pool = vocabulary.slice(30)
    if (pool.length < 6) pool = vocabulary // fallback
    
    setGameVocab(pool)
    setLevel(selectedLevel)
    
    setScore(0)
    setTimeLeft(60)
    setIsPlaying(true)
    setIsGameOver(false)
    startNewRound(pool)
  }

  // Timer logic
  useEffect(() => {
    let timer
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false)
      setIsGameOver(true)
      triggerConfetti()
    }
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  // Handle tile click
  const handleTileClick = (tile) => {
    if (!isPlaying) return
    if (selectedTiles.length === 2) return // Animating
    if (matchedPairs.includes(tile.matchId)) return
    if (selectedTiles.find(t => t.id === tile.id)) return // Already selected

    const newSelection = [...selectedTiles, tile]
    setSelectedTiles(newSelection)

    if (newSelection.length === 2) {
      // Check match
      if (newSelection[0].matchId === newSelection[1].matchId && newSelection[0].type !== newSelection[1].type) {
        // Match!
        setTimeout(() => {
          setMatchedPairs(prev => {
            const next = [...prev, newSelection[0].matchId]
            if (next.length === 6) {
              // Board cleared, start next round
              setTimeout(() => startNewRound(gameVocab), 500)
            }
            return next
          })
          setSelectedTiles([])
          setScore(s => s + 10)
          audioFX.playCorrect()
        }, 300)
      } else {
        // No match
        audioFX.playWrong()
        setTimeout(() => {
          setSelectedTiles([])
        }, 600)
      }
    }
  }

  if (!level && !isGameOver) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto flex flex-col p-8 font-sans">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/games')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-slate-800">Speed Match</h1>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
            <Zap size={40} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold mb-8">Select Level</h2>
          <div className="flex gap-4">
            {[1, 2, 3].map(lvl => (
              <button 
                key={lvl}
                onClick={() => startGame(lvl)}
                className="w-32 h-32 bg-white border-2 border-slate-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50 flex flex-col items-center justify-center transition-all"
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
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col py-6 pb-20 font-sans relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => {
            setIsPlaying(false)
            setLevel(null)
          }}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xl">
            <Zap fill="currentColor" /> {score}
          </div>
          <div className={`flex items-center gap-2 font-black text-xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
            <Clock /> {timeLeft}s
          </div>
        </div>
      </div>

      {!isPlaying && !isGameOver ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center flex-1"
        >
          <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-6">
            <Zap size={48} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Speed Match</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
            Match the words with their translations as fast as you can. You have 60 seconds!
          </p>
          <button 
            onClick={startGame}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Start Game
          </button>
        </motion.div>
      ) : isGameOver ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 text-center"
        >
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Time's Up!</h2>
          <p className="text-slate-500 mb-6">You scored</p>
          <div className="text-6xl font-black text-amber-500 mb-8 flex items-center gap-2">
            <Zap fill="currentColor" /> {score}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setLevel(null)}
              className="px-8 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
            >
              Change Level
            </button>
            <button 
              onClick={() => startGame(level)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw size={18} /> Play Again
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 flex-1 content-start">
          <AnimatePresence>
            {tiles.map((tile) => {
              const isMatched = matchedPairs.includes(tile.matchId)
              const isSelected = selectedTiles.find(t => t.id === tile.id)
              const isError = selectedTiles.length === 2 && isSelected && selectedTiles[0].matchId !== selectedTiles[1].matchId

              if (isMatched) return null // Hide matched tiles

              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: isError ? [-5, 5, -5, 5, 0] : 0
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleTileClick(tile)}
                  className={`
                    p-4 sm:p-6 rounded-2xl font-bold text-center border-2 transition-all min-h-[80px] flex items-center justify-center break-words
                    ${isSelected && !isError ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 scale-95' : ''}
                    ${isError ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-500' : ''}
                    ${!isSelected && !isError ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500/50' : ''}
                  `}
                >
                  <span className="text-sm sm:text-base leading-tight">
                    {tile.text}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
