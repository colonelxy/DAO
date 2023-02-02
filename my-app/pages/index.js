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
    console.error(e.message);

  }
};

const withdrawDAOEther = async () => {
  try {
    const signer = await getProviderOrSigner(true);
    const contract = getDaoContractInstance(signer);

    const tx = await contract.withdrawEther();
    setLoading(true);
    await tx.wait();
    setLoading(false);
    getDAOTreasuryBalance();

  } catch (e) {
    console.error(e);
    window.alert(e.reason);
  }
};

const getDAOTreasuryBalance = async () {
  try {
    const provider = await getProviderOrSigner();
    const balance = await provider.getBalance(
      DAO_CONTRACT_ADDRESS
    );
    setTreasuryBalance(balance.toString());

  } catch (e) {
    console.error(e);
  }
};

const getNumProposalsInDAO = async() => {
  try {
    const provider = await getProviderOrSigner();
    const contract = getDaoContractInstance(provider);
    const daoNumProposals = await contract.numProposals();
    setNumProposals(daoNumProposals.toString());

  } catch (e) {
    console.error(e);
  }
};

const getUserNFTBalance = async() => {
  try {
    const signer = await getProviderOrSigner(true);
    const nftContract = getCryptodevsNFTContractInstance(signer);
    const balance = await nftContract.balanceOf(signer.getAddress);
    setNftBalance(parseInt(balance.toString()));

  } catch (e) {
    console.error(e);
  }
};

const createProposal = async() => {
  try {

  } catch (e) {
    console.error(e);
    window.alert(e.reason);
  }
};

const fetchProposalById = async () => {
  try {
    const provider = await getProviderOrSigner();
    const daoContract = getDaoContractInstance(provider);
    const proposal = await daoContract.proposals(id);
    const parsedProposal = {
      proposalId: id,
      nftTokenId: proposal.nftTokenId.toString(),
      deadline: new Date(parseInt(proposal.deadline.toString())*1000),
      yayVotes: proposal.yayVotes.toString(),
      nayVotes: proposal.nayVotes.toString(),
      executed: proposal.executed,
    };
    return parsedProposal;

  } catch (e) {
    console.error(e);
  }
};

const fetchAllProposals = async () => {
  try {
    const proposals = [];
    for (let i =0; i<numProposals; i++) {
      const proposal = await fetchProposalById(i);
      proposals.push(proposal);
    }
    setProposals(proposals);
    return proposals;

  } catch (e) {
    console.error(e);
  }
};

const voteOnProposal = async(proposalId, _vote) => {
  try {
    const signer = await getProviderOrSigner(true);
    const daoContract = getDaoContractInstance(signer);

    let vote = _vote === "YAY" ? 0 : 1;
    const txn = await daoContract.voteOnProposal(proposalId, vote);
    setLoading(true);
    await txn.wait();
    setLoading(false);
    await fetchAllProposals();


  } catch (e) {
    console.error(e);
    window.alert(e.reason);
  }
};

  return (
    
  )
}
