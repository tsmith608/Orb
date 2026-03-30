import React from 'react';

const MainContent = () => {
  return (
    <main className="bg-gray-900 text-white">
      <div className="container mx-auto py-16 px-4">

        {/* About the Tournament Section */}
        <section id="about" className="mb-20 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-red-600 mb-6">
            WHAT IS THE TOURNAMENT?
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            This is not your average streetball game. The Tournament of Death is a single-elimination contest where the world's most ruthless players battle for supremacy. The court is a steel cage, the ball is forged in fire, and the stakes are life and death. We value aggression, dominance, and a complete disregard for your opponent's well-being.
          </p>
        </section>

        {/* The Rules Section */}
        <section className="mb-20 text-center">
          <h2 className="text-4xl font-bold text-red-600 mb-8">
            THE RULES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
              <h3 className="text-2xl font-bold text-white mb-3">
                RULE 1
              </h3>
              <p className="text-gray-400">
                No fouls. No mercy. Every play is a full-contact, brutal assault. The only whistle you'll hear is the wind from a missed shot.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
              <h3 className="text-2xl font-bold text-white mb-3">
                RULE 2
              </h3>
              <p className="text-gray-400">
                The game ends when one team is unable to continue. Or unwilling. Surrender is an option, but not one we respect.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-700">
              <h3 className="text-2xl font-bold text-white mb-3">
                RULE 3
              </h3>
              <p className="text-gray-400">
                Only the winning team leaves the cage. What happens to the losers? That's not your concern. Focus on winning.
              </p>
            </div>
          </div>
        </section>

        {/* The Grand Prize Section */}
        <section id="register" className="mb-20 max-w-3xl mx-auto text-center bg-black p-8 rounded-xl border-2 border-red-800">
          <h2 className="text-4xl font-bold text-red-600 mb-6">THE GRAND PRIZE</h2>
          <p className="text-gray-300 text-xl mb-4">
            Glory. Survival. And a briefcase containing...
          </p>
          <p className="text-5xl font-extrabold text-white tracking-widest">
            $10,000,000
          </p>
          <p className="text-gray-500 mt-4">(Ten Million Dollars)</p>
        </section>

        {/* The Venue Section */}
        <section id="venue" className="text-center">
          <h2 className="text-4xl font-bold text-red-600 mb-6">THE VENUE</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The games will be held at the abandoned Black Iron Foundry on the edge of town. The court is a steel cage, surrounded by roaring flames and the jeers of a bloodthirsty crowd. Be there or be forgotten.
          </p>
        </section>

      </div>
    </main>
  );
};

export default MainContent;
