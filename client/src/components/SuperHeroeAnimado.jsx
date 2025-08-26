import { useEffect, useRef, useState } from "react";

const SuperHeroeAnimado = () => {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      if (ref.current) {
        ref.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      }
    };

    const breatheInterval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.05 : 1));
    }, 3000);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(breatheInterval);
    };
  }, [scale]);

  return (
    <img
      ref={ref}
      src="/img/Superheroe-frontal.png"
      alt="superheroe"
      className="w-40 animate-breathe"

    />
  );
};

export default SuperHeroeAnimado;
