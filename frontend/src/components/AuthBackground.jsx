const AuthBackground = ({ children }) => {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-ink py-16 px-4 sm:px-6 lg:px-8">
      {/* Livery texture base */}
      <div className="absolute inset-0 livery-bg"></div>

      {/* Animated gradient wash */}
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-marigold-500/25 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] bg-route-500/25 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-rose-400/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
      </div>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink/90"></div>

      {/* Floating ride illustrations */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <svg className="absolute top-[12%] left-[10%] w-16 h-16 text-marigold-500/30 animate-[float_7s_ease-in-out_infinite]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13v6a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm3.5-4L5 13h14l-1.5-4H6.5zM6 15a1 1 0 100 2 1 1 0 000-2zm12 0a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
        <svg className="absolute bottom-[18%] left-[16%] w-10 h-10 text-route-400/30 animate-[float_9s_ease-in-out_infinite_1s]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a1 1 0 011 1v1.06A8.004 8.004 0 0119.94 11H21a1 1 0 110 2h-1.06A8.004 8.004 0 0113 19.94V21a1 1 0 11-2 0v-1.06A8.004 8.004 0 014.06 13H3a1 1 0 110-2h1.06A8.004 8.004 0 0111 4.06V3a1 1 0 011-1zm0 4a6 6 0 100 12 6 6 0 000-12z" />
        </svg>
        <svg className="absolute top-[22%] right-[12%] w-14 h-14 text-paper/15 animate-[float_8s_ease-in-out_infinite_0.5s]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm1 2v3h14V6H5zm0 5v7h6v-7H5zm8 0v7h6v-7h-6z" />
        </svg>
        <svg className="absolute bottom-[12%] right-[18%] w-9 h-9 text-marigold-400/25 animate-[float_10s_ease-in-out_infinite_1.5s]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.09 6.26L21 9l-5 4.14L17.18 21 12 17.27 6.82 21 8 13.14 3 9l6.91-.74L12 2z" />
        </svg>
      </div>

      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
};

export default AuthBackground;
