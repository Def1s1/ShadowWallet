import { useI18n } from '@/ui/hooks/useI18n';
import { useAccountAddress } from '@/ui/state/accounts/hooks';
import { copyToClipboard, shortAddress } from '@/ui/utils';
import { CopyOutlined } from '@ant-design/icons';

import { useTools } from '../ActionComponent';
import { Row } from '../Row';
import { Text } from '../Text';

export function AddressBar() {
  const tools = useTools();
  const address = useAccountAddress();
  const { t } = useI18n();
  return (
    <Row
      selfItemsCenter
      itemsCenter
      onClick={(e) => {
        copyToClipboard(address).then(() => {
          tools.toastSuccess(t('copied'));
        });
      }}>
      <Text text={shortAddress(address)} color="textDim" />
      {/*<Icon icon="copy" color="textDim" />*/}
      <CopyOutlined style={{ color: '#888', fontSize: 14 }} />
    </Row>
  );
}
