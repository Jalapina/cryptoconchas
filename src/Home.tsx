import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';
import styled from 'styled-components';
import { Container, Snackbar } from '@material-ui/core';
import { Button} from 'antd';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
// import Metadata from '@metaplex-foundation/mpl-token-metadata';
// import { deprecated } from "@metaplex-foundation/mpl-token-metadata";
import { programs } from '@metaplex/js';
import Typography from '@material-ui/core/Typography';
import { Connection, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
  TOKEN_METADATA_PROGRAM_ID
} from './candy-machine';
import { AlertState, toDate, formatNumber, getAtaForMint } from './utils';
import { MintCountdown } from './MintCountdown';
import { MintButton } from './MintButton';
import { GatewayProvider } from '@civic/solana-gateway-react';
import './blobz.css';
import './blob.css';
import conchaPink from './201.png';
import bs58 from 'bs58';
import $ from 'jquery';

import bakery from './bakery-shop.png';
import soon from './coming-soon.png';

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_ARRAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;
const candyMachineId = new PublicKey("G9BAVZ6QXiw7vJ5a61MjL97CD62saF5s2QwRpot4ux6x");
const ConnectButton = styled(WalletDialogButton)`
  width: 85%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: #fff2d8;
  font-size: 16px;
  font-weight: bold;
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const DisplayImage = ({nftAddress}:any,props: HomeProps) => {

  const [nftMetadata, setNftMetadata] = useState<any>();
  const[NftIsClicked, setNftIsClicked] = useState<boolean>(false);

  const handleClick = useCallback(
    () => setNftIsClicked(!NftIsClicked),
    [NftIsClicked, setNftIsClicked],
  );
  
  const GetURI = async () => {

    await fetch(nftAddress.uri , {
        cache: 'force-cache'
      })
      .then(data => {
        return data.json();
      })
      .then(data => {
        return setNftMetadata(data || []);
      })
      .catch(err => {
        return console.log(err);
    });
    
  };

  useEffect(() => {
    if(nftAddress){
      GetURI()
    }
  }, [nftAddress]);
  
  return (
      <div onClick={handleClick}>
        
        {nftMetadata?(
          <div className="NFT-container" style={{background:nftMetadata.attributes[2].value}}>
            <div className={"modal " + ( NftIsClicked ? `modalOpen` : "")}>
              
                <div  onClick={handleClick}  className="close-icon-wrapper">
                  {/* <img onClick={nftExpanded} className="close-icon" width="40px" src={closeIcon}/> */}
                </div>

                {NftIsClicked ?(
                  <div className="modal-container" style={{background:nftMetadata.attributes[2].value}}>

                    <div className="nft-image-focus">
                      <img width="200px" src={nftMetadata.image} />
                    </div>
                    
                    <div className="token-options">
                      <h2 className="token-name">{nftMetadata.name}</h2>
                      <a href={"https://solscan.io/token/"+nftAddress.address+"?cluster=devnet"}>Explorer</a>
                    </div>
                  </div>
                ): ""}
            </div>

            <img style={{width:"75%"}} src={nftMetadata ? nftMetadata?.image:""}/>

          </div>
        ):
        <div className="loading-animation" >

          <svg className="blob" viewBox="0 0 550 550" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(300,300)">
                <path d="M120,-157.6C152.7,-141.5,174.3,-102.6,194.8,-58.8C215.3,-14.9,234.6,33.8,228.4,80.8C222.2,127.8,190.4,173.1,148.1,184C105.8,195,52.9,171.5,-2.4,174.8C-57.8,178.2,-115.6,208.4,-137.5,190.9C-159.3,173.3,-145.3,108,-153,56.3C-160.7,4.6,-190.2,-33.4,-178.3,-54.2C-166.4,-75.1,-113.2,-78.8,-76.6,-93.6C-40,-108.3,-20,-134.2,11.9,-150.5C43.7,-166.8,87.4,-173.6,120,-157.6Z" fill="#FE840E" />
              </g>
          </svg>
                
        </div>
      }
      </div>
    );

}

const Home = (props: HomeProps) => {
  
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [isActive, setIsActive] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [isWhitelistUser, setIsWhitelistUser] = useState(false);
  const [isPresale, setIsPresale] = useState(false);
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>();

  const [isUserMinting, setIsUserMinting] = useState(false);
  const [isClicked,setIsClicked] = useState<boolean>(false)
  const [emptyArray,setEmptyArray] = useState<any[]>([])
  const [mintAddresses,setMintAddresses] = useState<any[]>([])
  const [walletNFTAddresses,setWalletNFTAddresses] = useState<any[]>([])

  const [viewCount, setViewCount] = useState({prevCount:24,newCount:24});

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const getMintAddresses = async (firstCreatorAddress: PublicKey) => {

    const metadataAccounts = await props.connection.getProgramAccounts(

      TOKEN_METADATA_PROGRAM_ID,
        {
          // The mint address is located at byte 33 and lasts for 32 bytes.
          // conditions to the data
          dataSlice: { offset: 33, length: 32 },

          filters: [
            // Only get Metadata accounts.
            { dataSize: MAX_METADATA_LEN },

            // Filter using the first creator.
            {
              memcmp: {
                offset: CREATOR_ARRAY_START,
                bytes: firstCreatorAddress.toBase58(),
              },
            },
          ],
        },
    );

    return metadataAccounts.map((metadataAccountInfo) => (
        bs58.encode(metadataAccountInfo.account.data)
    ));

  };

  const getCandyMachineCreator = async (candyMachine: PublicKey): Promise<[PublicKey, number]> => (
    PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachine.toBuffer()],
      CANDY_MACHINE_PROGRAM,
    )
  );

  const addViewCount = () =>{

    let newCount = viewCount.newCount + 5
    setViewCount({...viewCount, prevCount: viewCount.newCount});

    if(viewCount.newCount%mintAddresses.length===1){
      return viewCount
    }else if(newCount>mintAddresses.length){

      newCount = mintAddresses.length - viewCount.newCount;
      setViewCount({...viewCount, prevCount: viewCount.newCount, newCount:viewCount.newCount+newCount});
    }
    else{
      setViewCount({...viewCount,prevCount: viewCount.newCount, newCount:newCount});
    }

    setIsClicked(true);
  }

  const getNftMetadata = async () =>{
    const { Metadata } = programs.metadata;

    try{

      if(mintAddresses.length>0){
        for(let i=0;i<viewCount.newCount;i++){
          
            const metadata = await Metadata.getPDA(new PublicKey(mintAddresses[i]));
            const tokenMetadata = await Metadata.load(props.connection, metadata);
            setEmptyArray(oldArray => [...oldArray, {uri:tokenMetadata.data.data.uri,address:mintAddresses[i]}]);

          }
        }
        
    } 
    catch(err){
      console.log(err);
    }
  }

  const getNFTAddresses = async () => {
      const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
      const mints = await getMintAddresses(candyMachineCreator[0]);
          
      setMintAddresses(mints);
  };

  const updateArray = () => {

    const { Metadata } = programs.metadata;
    
      setTimeout(async() => {
        
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        
        const candyMachineCreator = await getCandyMachineCreator(candyMachineId);
        const mints = await getMintAddresses(candyMachineCreator[0]);
        
        if(mints.length>mintAddresses.length){

          const uniqueAddress = mints.filter(function(address) {
            return !mintAddresses.some(function(mintAddress) {
              return address == mintAddress;
            });
          });

          console.log("uniqueAddress",uniqueAddress[0])
          
          const metadata = await Metadata.getPDA(new PublicKey(uniqueAddress[0]));
          const tokenMetadata = await Metadata.load(props.connection, metadata);
          setEmptyArray(oldArray => [{uri:tokenMetadata.data.data.uri,address:uniqueAddress},...oldArray]);
          setMintAddresses(oldArray => [uniqueAddress[0],...oldArray]);
          setViewCount({...viewCount,newCount:viewCount.newCount+1});
        }

      }},37000);

  }
  
  useEffect(()=>{
    if(emptyArray.length<=1){
      getNftMetadata();
    }
  },[mintAddresses]);

  useEffect(()=>{
    
    if(isClicked){
      setIsClicked(false);
      const { Metadata } = programs.metadata;
      console.log(viewCount);
      const updateArrayCount = async () => {

        for(let i=viewCount.prevCount;i<viewCount.newCount;i++){
      
        const metadata = await Metadata.getPDA(new PublicKey(mintAddresses[i]));
        const tokenMetadata = await Metadata.load(props.connection, metadata);
        setEmptyArray(oldArray => [...oldArray, {uri:tokenMetadata.data.data.uri,address:mintAddresses[i]}]);

      }

    }
    updateArrayCount();
    }

  },[isClicked,setViewCount]);

  useEffect(()=>{
      if(emptyArray.length<=1){
        getNFTAddresses();
      }

  },[]);


  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }
    
    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);


  useEffect(()=>{

      if (wallet.connected && wallet.ready && wallet.publicKey) {
        console.log(wallet)
        getCurrentWalletNFTs();
      }
    
  },[wallet.connected, wallet.ready]);

  const getCurrentWalletNFTs =  async () =>{
    
    const { Metadata } = programs.metadata;
    
    try{
      if (wallet.connected && wallet.ready && wallet.publicKey) {
          
          const allNFTs = await Metadata.findDataByOwner(props.connection,wallet.publicKey);
          const CandyNFT = allNFTs.filter((r) => r.updateAuthority === "C5hqyJpUU1o28q2fcdyTkTwRdCCrDUqjccFnik9ZW25k");

          for(let i=0;i<CandyNFT.length;i++){
            setWalletNFTAddresses(oldArray => [{uri:CandyNFT[i].data.uri,address:CandyNFT[0].mint},...oldArray]);
          }
          
        }       
      } 
      catch(err){
        console.log(err);
      }
  }

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );
        let active =
          cndy?.state.goLiveDate?.toNumber() < new Date().getTime() / 1000;
        let presale = false;
        // whitelist mint?
        if (cndy?.state.whitelistMintSettings) {
          // is it a presale mint?
          if (
            cndy.state.whitelistMintSettings.presale &&
            (!cndy.state.goLiveDate ||
              cndy.state.goLiveDate.toNumber() > new Date().getTime() / 1000)
          ) {
            presale = true;
          }
          // is there a discount?
          if (cndy.state.whitelistMintSettings.discountPrice) {
            setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice);
          } else {
            setDiscountPrice(undefined);
            // when presale=false and discountPrice=null, mint is restricted
            // to whitelist users only
            if (!cndy.state.whitelistMintSettings.presale) {
              cndy.state.isWhitelistOnly = true;
            }
          }
          // retrieves the whitelist token
          const mint = new anchor.web3.PublicKey(
            cndy.state.whitelistMintSettings.mint,
          );
          const token = (await getAtaForMint(mint, anchorWallet.publicKey))[0];

          try {
            const balance = await props.connection.getTokenAccountBalance(
              token,
            );
            let valid = parseInt(balance.value.amount) > 0;
            // only whitelist the user if the balance > 0
            setIsWhitelistUser(valid);
            active = (presale && valid) || active;
          } catch (e) {
            setIsWhitelistUser(false);
            // no whitelist user, no mint
            if (cndy.state.isWhitelistOnly) {
              active = false;
            }
            console.log('There was a problem fetching whitelist token balance');
            console.log(e);
          }
        }
        // datetime to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number));
          if (
            cndy.state.endSettings.number.toNumber() <
            new Date().getTime() / 1000
          ) {
            active = false;
          }
        }
        // amount to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        if (cndy.state.isSoldOut) {
          active = false;
        }

        setIsActive((cndy.state.isActive = active));
        setIsPresale((cndy.state.isPresale = presale));
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        );
        
        let status: any = { err: true };
        if (mintTxId[0]) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId[0],
            props.txTimeout,
            props.connection,
            true,
          );
        }
        
        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        console.log(error.msg)
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
      // updates the candy machine state to reflect the lastest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setIsUserMinting(false);
      updateArray();      
    }
  };

  const toggleMintButton = () => {
    let active = !isActive || isPresale;

    if (active) {
      if (candyMachine!.state.isWhitelistOnly && !isWhitelistUser) {
        active = false;
      }
      if (endDate && Date.now() >= endDate.getTime()) {
        active = false;
      }
    }

    if (
      isPresale &&
      candyMachine!.state.goLiveDate &&
      candyMachine!.state.goLiveDate.toNumber() <= new Date().getTime() / 1000
    ) {
      setIsPresale((candyMachine!.state.isPresale = false));
    }

    setIsActive((candyMachine!.state.isActive = active));
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  return (
    <div className="mint-container">
      <Container
        style={{
          margin: `200px 0px 200px 0px`,
          overflow: ``,
          position: `relative`,
        }}
      >
        {/* <div style={{top: `93px`,position:`absolute`, left:`132px`, padding: `15px`}}>  
          <img style={{width: `200px`}} src={conchaPink} alt="concha"/>
        </div>   */}

        <Container maxWidth="xs" style={{ position: 'relative' }}>
          <div className="tk-blob">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341.4 374.7">
              <path d="M309.9 70.6c37.8 52.7 39.8 128.7 15.4 184.1-24.3 55.4-75 90.1-125.4 107.4-50.4 17.4-100.4 17.4-136.2-3.3-35.7-20.7-57.2-62-62.4-102.1-5.2-40.2 5.8-79 29.1-128.3C53.6 79.1 89.1 19.3 143.7 4.1 198.3-11.2 272 18 309.9 70.6z"></path>
            </svg>
          </div>
          <Paper
            style={{
              paddingBottom: 10,
              borderRadius: 6,
              margin: `auto`,
            }}
          >
            {!wallet.connected ? (
              <ConnectButton><p style={{color:"#000"}}>Connect Wallet</p></ConnectButton>
            ) : (
              <>
                {candyMachine && (
                  <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    wrap="nowrap"
                  >
                    <Grid item xs={3}>
                      <Typography variant="body2" color="textSecondary">
                        IN THE OVEN
                      </Typography>
                      <Typography
                        variant="h6"
                        color="textPrimary"
                        style={{
                          fontWeight: 'bold',
                        }}
                      >
                        {`${itemsRemaining}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        {isWhitelistUser && discountPrice
                          ? 'Discount Price'
                          : 'Price'}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="textPrimary"
                        style={{ fontWeight: 'bold' }}
                      >
                        {isWhitelistUser && discountPrice
                          ? ` ${formatNumber.asNumber(discountPrice)}`
                          : ` ${formatNumber.asNumber(
                              candyMachine.state.price,
                            )}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      {isActive && endDate && Date.now() < endDate.getTime() ? (
                        <>
                          <MintCountdown
                            key="endSettings"
                            date={getCountdownDate(candyMachine)}
                            style={{ justifyContent: 'flex-end' }}
                            status="COMPLETED"
                            onComplete={toggleMintButton}
                          />
                          <Typography
                            variant="caption"
                            align="center"
                            display="block"
                            style={{ fontWeight: 'bold' }}
                          >
                            TO END OF MINT
                          </Typography>
                        </>
                      ) : (
                        <>
                          <MintCountdown
                            key="goLive"
                            date={getCountdownDate(candyMachine)}
                            style={{ justifyContent: 'flex-end' }}
                            status={
                              candyMachine?.state?.isSoldOut ||
                              (endDate && Date.now() > endDate.getTime())
                                ? ''
                                : isPresale
                                ? ''
                                : ''
                            }
                            onComplete={toggleMintButton}
                          />
                          {isPresale &&
                            candyMachine.state.goLiveDate &&
                            candyMachine.state.goLiveDate.toNumber() >
                              new Date().getTime() / 1000 && (
                              <Typography
                                variant="caption"
                                align="center"
                                display="block"
                                style={{ fontWeight: 'bold' }}
                              >
                                UNTIL PUBLIC MINT
                              </Typography>
                            )}
                        </>
                      )}
                    </Grid>
                  </Grid>
                )}
                <MintContainer>
                  {candyMachine?.state.isActive &&
                  candyMachine?.state.gatekeeper &&
                  wallet.publicKey &&
                  wallet.signTransaction ? (
                    <GatewayProvider
                      wallet={{
                        publicKey:
                          wallet.publicKey ||
                          new PublicKey(CANDY_MACHINE_PROGRAM),
                        //@ts-ignore
                        signTransaction: wallet.signTransaction,
                      }}
                      gatekeeperNetwork={
                        candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                      }
                      clusterUrl={rpcUrl}
                      options={{ autoShowModal: false }}
                    >
                      <MintButton
                        candyMachine={candyMachine}
                        isMinting={isUserMinting}
                        onMint={onMint}
                        isActive={isActive || (isPresale && isWhitelistUser)}
                      />
                    </GatewayProvider>
                  ) : (
                    <MintButton
                      candyMachine={candyMachine}
                      isMinting={isUserMinting}
                      onMint={onMint}
                      isActive={isActive || (isPresale && isWhitelistUser)}
                    />
                  )}
                </MintContainer>
              </>
            )}
            <Typography
              variant="caption"
              align="center"
              display="block"
              style={{ marginTop: 7, color: 'grey', zIndex: `1` }}
            >
              CLICK FOR CONCHA
            </Typography>
          </Paper>
        </Container>

        <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
        
      </Container>
      <div className="inventory" style={{boxShadow:"inset 1px 1px 5px #000",background:"#ffd495",color:"#fff"}} >
        <div>

          {/* <img style={{width:"75%", margin:"10%"}} src={soon}/> */}
    
          {(() => {
            if(walletNFTAddresses.length>0){
              return(
                <div className="token-image-container" >
                  <h2 className="other-font minted-bakery-title" style={{fontFamily: 'Bounties'}}>Your Bakery</h2>
                  <p className="other-font mint-count">
                    {walletNFTAddresses.length}
                  </p>
                  {
                  walletNFTAddresses.map((nftAddress, index)=>{
                    return (
                      <div key={index} className="display-image-container" style={{display:"inline-block", position:"relative"}}>
                        <DisplayImage
                          nftAddress={nftAddress}
                          />
                      </div>
                    )})
                  }
                </div>
              )
            }else{
              return(                
                <div className="no-artwork">
                  
                   <p className="slideDown other-font low-on-bread">Getting your bread...</p> 

                </div>
                )
            }  
          })()}
        </div>

        {(() => {
            if(emptyArray.length>0){
              return(
                <div className="token-image-container" >
                  <h2 className="other-font minted-bakery-title" style={{fontFamily: 'Bounties'}}>Minted Bakery</h2>
                  <p className="other-font mint-count">
                    {mintAddresses.length}/1996
                  </p>
                  {
                  emptyArray.map((nftAddress, index)=>{
                    return (
                      <div key={index} className="display-image-container" style={{display:"inline-block"}}>

                        <DisplayImage
                          nftAddress={nftAddress}
                          />

                      </div>
                    )})
                  }

                                          
                        <div className="see-more-button">
                          {viewCount.newCount != mintAddresses.length ? (
                              <button onClick={addViewCount}>
                                See More
                              </button>
                            ):""
                          }
                        </div> 

                </div>
              )
            }else{
              return(                
                <div className="no-artwork">
                  
                  <p className="slideDown other-font low-on-bread">Getting this bread....</p>
                  <div className="bakery-image-container">
                    <img className="heartbeat" width="100px" src={bakery} />
                  </div>  

                </div>
                )
            }  
          })()}
      </div>
    </div>
  );
};

const getCountdownDate = (
  candyMachine: CandyMachineAccount,
): Date | undefined => {
  if (
    candyMachine.state.isActive &&
    candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }

  return toDate(
    candyMachine.state.goLiveDate
      ? candyMachine.state.goLiveDate
      : candyMachine.state.isPresale
      ? new anchor.BN(new Date().getTime() / 1000)
      : undefined,
  );
};

export default Home;
