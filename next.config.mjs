/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // As fotos vêm de hosts externos (watermark do dash, Storage Supabase, CDNs
    // usados nas landings). Liberamos os hosts conhecidos; ampliar conforme surgirem.
    remotePatterns: [
      { protocol: 'https', hostname: 'octodash-octo-dash.fltgo5.easypanel.host' },
      { protocol: 'https', hostname: 'glbtwvusiaaovllxhiig.supabase.co' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'vvcconstrutora.com.br' },
    ],
  },
  // Landings publicadas como HTML, não como componente React.
  //
  // As 23 landings antigas foram convertidas uma a uma para React (ver o
  // cabeçalho de qualquer componente em components/). Estas vão ao ar como
  // HTML, servidas de public/<slug>/index.html numa URL limpa.
  //
  // Altissimi, Oásis e Vila Triunfo chegaram prontas do Wix, autocontidas.
  // Reserva Castanheira chegou como bundle auto-extraível de 4,7 MB (formato
  // dc-runtime, o mesmo das 23) e foi desempacotada aqui: as fotos e fontes
  // viraram arquivos, as variáveis de template viraram valor literal e o
  // estado do formulário virou um script curto. Desempacotar em vez de portar
  // preserva o layout exatamente como o cliente aprovou.
  //
  // O que elas NÃO herdam por não serem React: cabeçalho e rodapé do portal,
  // botão flutuante de volta para /lotus-lancamentos e o banner de cookies.
  // Ao convertê-las para componente, apagar a entrada aqui e criar app/<slug>/.
  async rewrites() {
    return [
      { source: '/altissimi', destination: '/altissimi/index.html' },
      { source: '/oasis', destination: '/oasis/index.html' },
      { source: '/vila-triunfo', destination: '/vila-triunfo/index.html' },
      { source: '/reserva-castanheira', destination: '/reserva-castanheira/index.html' },
    ];
  },
};

export default nextConfig;
