import Head from 'next/head'
import {Contract, providers } from 'ethers'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import {useEffect, useRef, useState} from 'react'
import Web3Modal from 'web3modal'
import {formatEther} from 'ethers/lib/utils'
import {
  DAO_ABI,
  NFT_ABI,
  NFT_CONTRACT_ADRRESS,
  DAO_CONTRACT_ADDRESS
} from '../constants'



export default function Home() {

const [treasuryBalance, setTreasuryBalance] = useState("0");
const [numProposals, setNumProposals] = useState("0");
const [proposals, setProposals] = useState([]);
const [ nftBalance, setNftBalance] = useState(0);
const [ faleNftTokenId, setFakeNftTokenId]= useState("");
const [ selectedTab, setSelectedTab] = useState("");
const [loading, setLoading] = useState(false);
const [wallectConnected, setWalletConnected] = useState(false);
const [isOwner, setIsOwner] = useState(false);
const web3ModalRef = useRef();

const connectWallet = async()=> {
  try{
    await getProviderOrSigner();
    setWalletConnected(true);

  } catch (e) {
    console.error(e);
  }
};

const getDAOOwner = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const contract = getDaoContractInstance(signer);

    const _owner = await contract.owner();
    const address = await signer.getAddress();
    if (DAO_CONTRACT_ADDRESS.toLowerCase() === _owner.toLowerCase()) {
      setIsOwner(true);
    }

  } catch (e) {
    console.error(e);
  }
}

  return (
    
  )
}
