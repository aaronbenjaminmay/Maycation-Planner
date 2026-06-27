import { useState, useRef, useCallback, useEffect, type ChangeEvent, type KeyboardEvent } from 'react'
import { FormRow } from './FormRow'
import { FeedbackMessage } from './FeedbackMessage'
import { IconButton } from './IconButton'
import type { PlaceInputQuickPick, PlaceSuggestion, PlaceValue } from '../../lib/places'
import './PlaceInput.css'

type PlaceInputProps = {
  label: string
  value: PlaceValue | null
  onChange: (place: PlaceValue | null) => void
  onSearchPlaces: (query: string) => Promise<PlaceSuggestion[]>
  defaultQuery?: string
  placeholder?: string
  disabled?: boolean
  hint?: string
  quickPicks?: PlaceInputQuickPick[]
}

export function PlaceInput({
  label,
  value,
  onChange,
  onSearchPlaces,
  defaultQuery,
  placeholder = 'Search for a place…',
  disabled,
  hint,
  quickPicks,
}: PlaceInputProps) {
  const [query, setQuery] = useState(defaultQuery ?? '')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchIdRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setSuggestions([])
        setShowResults(false)
        setIsLoading(false)
        setError(null)
        return
      }

      const id = ++searchIdRef.current
      setIsLoading(true)
      setError(null)
      setShowResults(true)

      try {
        const results = await onSearchPlaces(q)
        if (id !== searchIdRef.current) return
        setSuggestions(results)
      } catch (err) {
        if (id !== searchIdRef.current) return
        setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
        setSuggestions([])
      } finally {
        if (id === searchIdRef.current) setIsLoading(false)
      }
    },
    [onSearchPlaces],
  )

  // Run an immediate search if defaultQuery is provided
  useEffect(() => {
    if (defaultQuery && defaultQuery.trim().length >= 2) {
      void runSearch(defaultQuery)
    }
    // Intentionally run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setActiveIndex(-1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setSuggestions([])
      setShowResults(false)
      setError(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(q)
    }, 300)
  }

  const handleSelect = (suggestion: PlaceSuggestion) => {
    onChange({
      name: suggestion.name,
      address: suggestion.address,
      coordinates: suggestion.coordinates,
    })
    setQuery('')
    setSuggestions([])
    setShowResults(false)
    setActiveIndex(-1)
    setError(null)
  }

  const handleSelectQuickPick = (pick: PlaceInputQuickPick) => {
    onChange(pick.value)
    setQuery('')
    setSuggestions([])
    setShowResults(false)
    setActiveIndex(-1)
    setError(null)
  }

  const handleManualEntry = () => {
    const name = query.trim()
    if (!name) return
    onChange({ name, address: '', coordinates: undefined })
    setQuery('')
    setSuggestions([])
    setShowResults(false)
    setActiveIndex(-1)
    setError(null)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setSuggestions([])
    setShowResults(false)
    setActiveIndex(-1)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (showResults) {
        // Prevent ModalSheet from closing while the results list is open
        e.stopPropagation()
        setSuggestions([])
        setShowResults(false)
        setActiveIndex(-1)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      if (!showResults || suggestions.length === 0) return
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      if (!showResults || suggestions.length === 0) return
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    }
  }

  if (value !== null) {
    const isManual = value.coordinates === undefined
    return (
      <FormRow label={label} hint={hint}>
        <div className="place-input place-input--selected">
          <div className="place-input__selected-content">
            <div className="place-input__selected-text">
              <span className="place-input__selected-name">{value.name}</span>
              {value.address && value.address !== value.name ? (
                <span className="place-input__selected-address">{value.address}</span>
              ) : null}
              {isManual ? (
                <span className="place-input__manual-badge">Entered manually</span>
              ) : null}
            </div>
            <IconButton
              icon="close"
              label="Clear place"
              onClick={handleClear}
              disabled={disabled}
            />
          </div>
        </div>
      </FormRow>
    )
  }

  const hasNoResults =
    showResults && query.length >= 2 && !isLoading && !error && suggestions.length === 0
  const canUseManual = query.trim().length >= 2

  return (
    <FormRow label={label} hint={hint}>
      <div className="place-input">
        {quickPicks && quickPicks.length > 0 ? (
          <div className="place-input__quick-picks">
            {quickPicks.map((pick) => (
              <button
                key={pick.id}
                type="button"
                className="place-input__quick-pick"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelectQuickPick(pick)
                }}
              >
                <span className="place-input__quick-pick-label">{pick.label}</span>
                {pick.sublabel ? (
                  <span className="place-input__quick-pick-sublabel">{pick.sublabel}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
        <div className="place-input__input-row">
          <input
            ref={inputRef}
            className="form-control"
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={showResults && suggestions.length > 0}
            aria-haspopup="listbox"
            aria-autocomplete="list"
          />
          {isLoading ? <span className="place-input__spinner" aria-hidden="true" /> : null}
        </div>

        {showResults && suggestions.length > 0 ? (
          <ul
            className="place-input__results"
            role="listbox"
            aria-label={`Suggestions for ${query}`}
          >
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                className={`place-input__result${i === activeIndex ? ' place-input__result--active' : ''}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(s)
                }}
              >
                <span className="place-input__result-name">{s.name}</span>
                <span className="place-input__result-address">{s.address}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {hasNoResults ? (
          <div className="place-input__empty">
            <span className="place-input__empty-message">
              No places found for &ldquo;{query}&rdquo;
            </span>
            <button
              type="button"
              className="place-input__use-text-btn"
              onMouseDown={(e) => {
                e.preventDefault()
                handleManualEntry()
              }}
            >
              Use &ldquo;{query}&rdquo; as place name
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="place-input__error-state">
            <FeedbackMessage tone="error">{error}</FeedbackMessage>
            {canUseManual ? (
              <button
                type="button"
                className="place-input__use-text-btn"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleManualEntry()
                }}
              >
                Use &ldquo;{query}&rdquo; as place name instead
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormRow>
  )
}
