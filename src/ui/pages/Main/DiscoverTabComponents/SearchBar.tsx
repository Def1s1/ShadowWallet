import { Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { Column, Input, Row, Text } from '@/ui/components';
import { useI18n } from '@/ui/hooks/useI18n';
import { useChain } from '@/ui/state/settings/hooks';
import { shortAddress, useWallet } from '@/ui/utils';
import { EnterOutlined } from '@ant-design/icons';

const p2pkhRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34})$/;
const p2shRegex = /^(3[a-km-zA-HJ-NP-Z1-9]{25,34})$/;
const bech32Regex = /^(bc1[a-z0-9]{39,59})$/;
const txidRegex = /^[a-fA-F0-9]{64}$/;
const blockRegex = /^\d{1,8}$/;

function isAddress(txt: string) {
  return p2pkhRegex.test(txt) || p2shRegex.test(txt) || bech32Regex.test(txt);
}

function isTxid(txt: string) {
  return txidRegex.test(txt);
}

function isBlock(str: string) {
  if (blockRegex.test(str)) {
    const num = parseInt(str, 10);
    return num < 4194303;
  }
  return false;
}

export function SearchBar() {
  const chain = useChain();
  const wallet = useWallet();
  const { t } = useI18n();

  const [info, setInfo] = useState<{ allTransactions: number | string; allAddrs: number | string }>();

  const [value, setValue] = useState<string>('');
  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    wallet
      .getBlockActiveInfo()
      .then(setInfo)
      .catch(() => {
        setInfo({
          allAddrs: '-',
          allTransactions: '-'
        });
      });
  }, []);

  const { searchContent, onSearch } = useMemo(() => {
    if (value) {
      if (isAddress(value)) {
        const onSearch = () => {
          window.open(chain.unisatExplorerUrl + '/address/' + value);
        };

        return {
          searchContent: (
            <Row py={'lg'} px={'lg'} clickable onClick={onSearch}>
              <Text text={t('address_preview')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
              <Text text={shortAddress(value)} fullX />
              <EnterOutlined style={{ color: '#ccc', fontSize: 14 }} />
            </Row>
          ),
          onSearch
        };
      }

      if (isTxid(value)) {
        const onSearch = () => {
          window.open(chain.unisatExplorerUrl + '/tx/' + value);
        };
        return {
          searchContent: (
            <Row py={'lg'} px={'lg'} clickable onClick={onSearch}>
              <Text text={t('transaction_preview')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
              <Text text={shortAddress(value)} fullX />
              <EnterOutlined style={{ color: '#ccc', fontSize: 14 }} />
            </Row>
          ),
          onSearch
        };
      }

      if (isBlock(value)) {
        const onSearch = () => {
          window.open(chain.unisatExplorerUrl + '/block/' + value);
        };
        return {
          searchContent: (
            <Row py={'lg'} px={'lg'} clickable onClick={onSearch}>
              <Text text={t('block_preview')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
              <Text text={value} fullX />
              <EnterOutlined style={{ color: '#ccc', fontSize: 14 }} />
            </Row>
          ),
          onSearch
        };
      }

      const onSearch = () => {
        window.open(chain.unisatUrl + '/search2?type=text&q=' + value);
      };

      return {
        searchContent: (
          <Row py={'lg'} px={'lg'} clickable onClick={onSearch}>
            <Text text={t('text_preview')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
            <Text text={value} fullX ellipsis />
            <EnterOutlined style={{ color: '#ccc', fontSize: 14 }} />
          </Row>
        ),
        onSearch
      };
    }

    function gotoExplorer() {
      window.open(chain.unisatExplorerUrl);
    }

    return {
      searchContent: (
        <Column py={'lg'} px={'lg'} gap={'lg'}>
          <Row justifyBetween itemsCenter>
            <Text text={t('transactions_24h')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
            {!info ? <Spin size={'small'} /> : <Text text={info.allTransactions} digital />}
          </Row>
          <Row justifyBetween itemsCenter>
            <Text text={t('active_addresses_24h')} preset={'sub'} size={'sm'} style={{ whiteSpace: 'nowrap' }} />
            {!info ? <Spin size={'small'} /> : <Text text={info.allAddrs} digital />}{' '}
          </Row>
          <Text
            text={t('go_to_unisat_explorer')}
            size={'xs'}
            selfItemsCenter
            color={'primary'}
            onClick={gotoExplorer}
          />
        </Column>
      ),
      onSearch: gotoExplorer
    };
  }, [value, info, chain, t]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (focused && event.key === 'Enter') {
        onSearch && onSearch();
      }
    };

    // add event listener
    window.addEventListener('keypress', handleKeyPress);

    // clean up
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [onSearch, focused]);

  return (
    <Column bg={'search_bar_bg'}>
      <Input
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        preset={'search'}
        placeholder={t('search_address_and_txids')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSearch={onSearch}
      />
      <Column
        bg={'search_bar_bg'}
        style={{
          borderRadius: 8,
          overflow: 'hidden'
        }}>
        {searchContent}
      </Column>
    </Column>
  );
}
