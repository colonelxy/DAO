import Head from 'next/head'
import {Contract, providers } from 'ethers'
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
const [ fakeNftTokenId, setFakeNftTokenId]= useState("");
const [ selectedTab, setSelectedTab] = useState("");
const [loading, setLoading] = useState(false);
const [wallectConnected, setWalletConnected] = useState(false);
const [isOwner, setIsOwner] = useState(false);
const web3ModalRef = useRef();



const connectWallet = async () => {
  try {
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
  };
};

const getDAOTreasuryBalance = async () => {
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
    const balance = await nftContract.balanceOf(signer.getAddress());
    setNftBalance(parseInt(balance.toString()));

  } catch (e) {
    console.error(e);
  }
};

const createProposal = async() => {
  try {
    const signer = await getProviderOrSigner(true);
    const daoContract=getDaoContractInstance(signer);
    const tx=await daoContract.createProposal(fakeNftTokenId);
    setLoading(true);
    await tx.wait();
    await getNumProposalsInDAO();
    setLoading(false);

  } catch (e) {
    console.error(e);
    window.alert(e.data.message);
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

const executeProposal = async (proposalId) =>{
  try {
    const signer = await getProviderOrSigner(true);
    const daoContract = getDaoContractInstance(signer);
    const tx = await daoContract.executeProposal(proposalId);
    setLoading(true);
    await tx.wait();
    setLoading(false);
    await fetchAllProposals();
    getDAOTreasuryBalance();

  } catch (e) {
    console.error(e);
    window.alert(e.reason);
  }
};

const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  const {chainId} = await web3Provider.getNetwork();
  if(chainId !==5) {
    window.alert("Please switch to Goerli network");
    throw new Error("Please switch to the Goerli network");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};

const getDaoContractInstance = (providerOrSigner) => {
  return new Contract(
    DAO_CONTRACT_ADDRESS,
    DAO_ABI,
    providerOrSigner
  );
};

const getCryptodevsNFTContractInstance = (providerOrSigner) =>{
  return new Contract(
    NFT_CONTRACT_ADRRESS,
    NFT_ABI,
    providerOrSigner
  );
};

useEffect(() => {
  if (!wallectConnected) {
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider:false,
    });

    connectWallet()
    .then(() => {
      getDAOTreasuryBalance();
      getUserNFTBalance();
      getNumProposalsInDAO();
      getDAOOwner();
    });
  }
}, [wallectConnected]);


useEffect(() => {
  if(selectedTab === "View Proposals") {
    fetchAllProposals();
  }
}, [selectedTab]);

function renderTabs() {
  if (selectedTab === "Create Proposal") {
    return renderCreateProposalTab();
  } else if (selectedTab === "View Proposals") {
    return renderViewProposalTab();
  }
  return null;
}

function renderCreateProposalTab() {
  if (loading) {
    return (
      <div className={styles.description}>
        Loading ... Creating proposal...
      </div>
    );
  } else if (nftBalance === 0) {
    return (
      <div className={styles.description}>
        You do not own any CryptoDevs NFTs. <br/>
        <b>You cannot create or vote on proposals</b>
      </div>
    );
  } else {
    return (
      <div>
        <label>Fake NFT Token ID to Purchase: </label>
        <input
          placeholder='0'
          type='number'
          onChange={(e) => setFakeNftTokenId(e.target.value)}
         />
         <button className={styles.button2} onClick={createProposal}>
          Create Proposal
         </button>
      </div>
    );
  }
}

function renderViewProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.proposalCard}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content='CryptoDevs DAO' />
        <link  rel='icon' href='/favicon.ico'/>
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs!</h1>
          <div className={styles.description}>Welcome to the DAO</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance} 
            <br/>

            Treasury Balance: {formatEther(treasuryBalance)} ethers<br/>

            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button className={styles.button} onClick={() => setSelectedTab("Create Proposal")}> Create Proposal</button>
            <button className={styles.button} onClick={() => setSelectedTab("View Proposals")}>View Proposals</button>
          </div>
          {renderTabs()}
          {isOwner? (
            <div>
              {loading? <button className={styles.button}> Loading...</button>
              : <button className={styles.button} onClick={withdrawDAOEther}>
                Withdraw DAO ETH</button>}
            </div>
          ) : ("")}
        </div>
        <div>
          <img className={styles.image} src='/cryptodevs/0.svg'/>
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by CryptoGuys
      </footer>
            
    </div>
    
  );
}
