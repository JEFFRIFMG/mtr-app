'use client';

export default function ContactForm() {
  return (
    <form className="w-full max-w-2xl mx-auto flex flex-col gap-5 text-left animate-fadeIn">
      {/* Input Nama */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Name"
          className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors"
        />
      </div>

      {/* Input Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Email"
          className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors"
        />
      </div>

      {/* Input Pesan */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Message"
          className="w-full bg-white/3 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B] transition-colors resize-none"
        />
      </div>

      {/* Tombol Outline Transparan Sesuai Gambar Production */}
      <button
        type="submit"
        className="w-full bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold py-3 rounded-lg text-sm transition-all cursor-pointer mt-2"
      >
        Send Message
      </button>
    </form>
  );
}