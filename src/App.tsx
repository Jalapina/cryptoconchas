import './App.css';
import { useMemo,useRef } from 'react';
import * as anchor from '@project-serum/anchor';
import Home from './Home';

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import './index.sass';
import './roadmap.scss';
import './blobz.min.css';
import { ThemeProvider, createTheme } from '@material-ui/core';
import logo from './conchas-logo.png';
import PinkInstagram from './pink-instagram.png';
import discord from './discord.png';
import twitter from './twitter.png';
import conchaPink from './201.png';
import concha from "./crypto-conchas-logo.png"
import Cornsilk from "./Cornsilk-concha.png"
import royal from "./royal-blue-v2.png"
import chef from "./chef-boi.png"
import software from "./software.png"

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl('devnet'),
);

const txTimeoutInMilliseconds = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  let myRef = useRef<HTMLDivElement>(null);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [],
  );

  return (
    <div className="appContainer">
      <ThemeProvider theme={theme}>
        <div style={{ background: ``, textAlign: `center`, padding: `35px` }}>
          <img style={{ width: `321px` }} src={logo} alt="Bubbles fonts" />
        </div>
        <div className="mint-container-background"></div>

        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <Home
                candyMachineId={candyMachineId}
                connection={connection}
                txTimeout={txTimeoutInMilliseconds}
                rpcHost={rpcHost}
                myRef={myRef}
              />
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>

        <div className="timeline"> 
          <div className="timeline__event  animated fadeInUp delay-3s timeline__event--type1">
            <div className="timeline__event__icon">
              <i className="lni-burger"></i>
              <img src={Cornsilk}/>              
            </div>
            <div className="timeline__event__content ">
              <div className="timeline__event__title">
                Launch
              </div>
              <div className="timeline__event__description">
                <p>Crypto conchas will launch with a limited supply of 1000 mintable NFTs!</p>
              </div>
            </div>
          </div>
          <div className="timeline__event animated fadeInUp delay-1s timeline__event--type3">
            <div className="timeline__event__icon">
              <img src={concha}/>
            
              <i className="lni-slim"></i>
            </div>
            <div className="timeline__event__content">
              <div className="timeline__event__title">
                50 Concha Giveaway
              </div>
              <div className="timeline__event__description">
                <p>25 minted Conchas wiil be sent out to early social media followers</p>
                <p>The next 25 conchas minted will be free on launch day</p>
              </div>

            </div>
          </div>
          <div className="timeline__event animated fadeInUp delay-2s timeline__event--type2">
            <div className="timeline__event__icon yellow-icon">
              <i className="lni-cake"></i>
              <img src={concha}/>
            </div>
            <div className="timeline__event__content">
              <div className="timeline__event__title">
                Winner
              </div>
              <div className="timeline__event__description">
                <p>Winner of 1 Solana raffel will be announced</p>
                <p>When Crypto Conchas first edition sells out, a random holder will be chosen for our 1 solana giveaway</p>
              </div>
            </div>
          </div>
          <div className="timeline__event animated fadeInUp timeline__event--type1">
            <div className="timeline__event__icon">
              <i className="lni-cake"></i>
              <img src={royal}/>
            </div>
         <div className="timeline__event__content">
              <div className="timeline__event__title">
                Evolution
              </div>
              <div className="timeline__event__description">
                <p>Once first edition has been fully minted, our team will work on a new and evolved concha. We will also venture into new blockchain projects that holders will have early access to.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="the-team-container">
          <h2>The Team</h2>

          <div className="the-team">
            <h3>Software</h3>
            <img src={chef}/>            
          </div>

          <div className="the-team">
            <h3>Artist</h3>
            <img src={software}/>
          </div>
        </div>

        <div className="social-media">
          <div className="social-media-image-container">
            <a
              href="https://www.instagram.com/cryptoconchas/"
              className="social-media-link"
            >
              <img src={PinkInstagram} />
            </a>
          </div>
          <div className="social-media-image-container">
            <a
              href="https://discord.gg/EbeAgZXSn9/"
              className="social-media-link"
            >
              <img src={discord} />
            </a>
          </div>

          <div className="social-media-image-container">
            <a
              href="https://twitter.com/ConchasCrypto"
              className="social-media-link"
            >
              <img src={twitter} />
            </a>
          </div>
        </div>

        <div className="faq-container">
          <div className="wave"></div>

          <div className="faq-header" ref={myRef}>
            <h1>FAQ</h1>
          </div>

          <div className="faq-container">
            <div className="faq">
              <div className="faq-question">
                <h2>How do I get one?</h2>
              </div>
              <div className="faq-answer">
                <ul>
                  <li>
                    Download and install a Chrome browser plugin called{' '}
                    <a href="https://phantom.app/download">Phantom Wallet</a>.
                    This will allow websites <span style={{fontFamily:'Bounties'}}> (that you authorize) </span>access to your
                    Solana account.
                  </li>
                  <li>
                    If you're on mobile, try using the{' '}
                    <a href="https://phantom.app/download">
                      IOS Phantom Wallet App
                    </a>
                  </li>
                  <li>
                    Once you have the plugin installed, or app the website will
                    recognize it and then display a MINT button to purchase a
                    Concha.
                  </li>
                </ul>
              </div>
            </div>

            <div className="faq">
              <div className="faq-question" >
                <h2>What's an NFT?</h2>
              </div>
              <div className="faq-answer">
                <ul >
                  <li>
                    Non-fungible token or NFT is a unique token that points to{" "}
                    <span style={{fontFamily:'Bounties'}}>WHATEVER YOU WANT</span>, usually a URL of a picture, video or a
                    concha.
                  </li>

                  <li>
                    NFT's usally have one owner and can be verified on the
                    ledger.
                  </li>

                  <li>
                    A Non-fungible token cannot be dubplicated and is stored in
                    the blockchain.
                  </li>
                </ul>
              </div>
            </div>

            <div className="faq">
              <div className="faq-question">
                <h2>How to get a crypto wallet</h2>
              </div>
              <div className="faq-answer">
                <ul>
                  <li>
                    Download and install the{" "}
                    <a href="https://phantom.app/download">Phantom Wallet</a> if
                    you're on chrome or a suitable alternative.
                  </li>
                </ul>
              </div>
            </div>

            <div className="faq">
              <div className="faq-question">
                <h2>What's the blockchain?</h2>
              </div>
              <div className="faq-answer">
                <ul>
                  <li>
                    The blockchain is a distributed database <span style={{fontFamily:'Bounties'}}>(Used to store
                    data).</span>
                  </li>
                  <li>
                    The data stored on a blockchain is a ledger of transactions.
                  </li>
                  <li>
                    Blockchains store data <span style={{fontFamily:'Bounties'}}>(transactions)</span> in chronological
                    groups, known as blocks, instead of folders and tables like
                    normal databases.
                  </li>
                  <li>
                    Bitcoin | Ethereum & Solana's blockchain is open and
                    accessible to anyone, unlike a centralized database run by a
                    company.
                  </li>
                  <li>
                    Unlike databases where information can be added, removed or
                    edited, blockchains can only be added to.
                  </li>
                </ul>
              </div>
            </div>

            <div className="faq">
              <div className="faq-question">
                <h2>What are conchas?</h2>
              </div>
              <div className="faq-answer">
                <p>
                  Conchas get their name from their round shape and striped
                  seashell <span style={{fontFamily:'Bounties'}}>(concha in spanish)</span> like appearance. A concha consists
                  of two parts; a sweetened bread roll, and a crunchy topping.
                </p>
                <p>
                  Conchas are a Mexican style sweet bread that was orignially
                  inspiration by Brioche, but somewhere along the way we decided
                  to make it fun and added colorful sugar on top and now rest is
                  history. You can find conchas all over North America at any
                  Mexican bakery <span style={{fontFamily:'Bounties'}}>(Mexico and the U.S)</span>
                </p>
              </div>
            </div>
            <div className="faq">
              <div className="faq-question">
                <h2>How to make conchas</h2>
              </div>
              <div className="faq-answer">
                <p>
                  Easy! All you need it flour 🍞 butter 🧈 milk 🥛 eggs 🥚 and baking
                  powder
                </p>
                <a
                  className="recipe-link"
                  href="https://www.mexicoinmykitchen.com/concha-recipe/"
                >
                  Concha recipe
                </a>
                <a
                  className="recipe-link"
                  href="https://www.youtube.com/watch?v=cCX3fqfEfZg"
                >
                  Concha video recipe (Spanish)
                </a>
              </div>
            </div>
            <div className="faq">
              <div className="faq-question">
                <h2>Who are we?</h2>
              </div>
              <div className="faq-answer">
                <p>
                  We're a small team of developers trying to build cool things
                  on the internet.
                </p>
                <p>
                  We like  blockchain technology and all it can do. Our team invisions a future where we all use, so we created something fun with it.
                </p>
                <p>
                  We want to build better and cooler things, <span style={{fontFamily:'Bounties'}}>Crypto Conchas</span> was just the begining. ✌️ 
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default App;
