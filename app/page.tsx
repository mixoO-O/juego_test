"use client";
import axios from "axios";
import { useState, useEffect } from "react";

type Card = {
  id: number;
  value: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function Home() {
  const [name, setName] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);

  const handleCardClick = (card: Card) => {
    if (flippedCards.length === 2 || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    // Voltear la carta
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c)),
    );

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (first.value === second.value) {
        // Acierto
        setMatches(matches + 1); // Aumentar el contador de aciertos
        setCards((prev) =>
          prev.map((c) =>
            c.value === first.value ? { ...c, isMatched: true } : c,
          ),
        );
        setFlippedCards([]);
      } else {
        // Error
        setErrors(errors + 1); // Aumentar el contador de errores
        setTimeout(() => {
          // Ocultar las cartas
          setCards((prev) =>
            prev.map((c) =>
              c.isFlipped && !c.isMatched ? { ...c, isFlipped: false } : c,
            ),
          );
          setFlippedCards([]);
        }, 1000); // Las cartas se ocultan después de 1 segundo
      }
    }
  };

  const fetchImagesAndSetCards = async () => {
    try {
      const response = await axios.get(
        "https://challenge-uno.vercel.app/api/images",
      );
      const images = response.data;

      const cardValues = images.slice(0, 9); // Seleccionar 6 imágenes únicas
      const shuffledCards = [...cardValues, ...cardValues]
        .sort(() => Math.random() - 0.5)
        .map((image, index) => ({
          id: index,
          value: image.title,
          imageUrl: image.url,
          isFlipped: false,
          isMatched: false,
        }));

      setCards(shuffledCards);
    } catch (error) {
      console.error("Error al obtener las imágenes:", error);
    }
  };

  const handleRestart = () => {
    setMatches(0); // Reiniciar los aciertos
    setErrors(0); // Reiniciar los errores
    setFlippedCards([]); // Reiniciar las cartas volteadas
    setCards([]); // Reiniciar todas las cartas
    fetchImagesAndSetCards(); // Volver a obtener las imágenes
  };

  useEffect(() => {
    fetchImagesAndSetCards();
  }, []);

  useEffect(() => {
    if (!name) {
      const userName =
        prompt("¡Bienvenido! Por favor, introduce tu nombre:") || "Jugador";
      setName(userName);
    }
  }, [name]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-2xl font-bold text-white">Juego de Memoria</h1>
      {name && <h2 className="mb-4 text-xl text-white">¡Hola, {name}!</h2>}
      <div className="my-2 flex gap-4 text-white">
        <p className="text-lg">Aciertos: {matches}</p>
        <p className="text-lg">Errores: {errors}</p>
      </div>
      <div className="grid grid-cols-6 gap-4 max-w-6xl">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`w-20 h-20 flex items-center justify-center border rounded-lg cursor-pointer text-2xl font-bold transition-transform duration-300 ${
              card.isFlipped || card.isMatched
                ? "bg-black text-white"
                : "bg-green-400"
            }`}
            onClick={() => handleCardClick(card)}
          >
            {card.isFlipped || card.isMatched ? (
              <img
                src={card.imageUrl}
                alt={card.value}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        {matches === cards.length / 2 && (
          <h3 className="text-xl font-bold text-green-500">
            ¡Felicidades {name}, has ganado!
          </h3>
        )}
        {(matches === cards.length / 2 || errors >= 2) && (
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            onClick={handleRestart}
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
}
