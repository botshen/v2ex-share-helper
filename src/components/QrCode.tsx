import { QRCodeSVG } from 'qrcode.react'

export const QrCode = ({ url }) => {
  return (
    <div className="mt-6 flex justify-end items-center">
      <div className='flex flex-row gap-3 items-center justify-center text-lg'>
        <div className='flex flex-col items-center justify-center text-lg'>
          <div>长按扫码</div>
          <div>查看详情</div>
        </div>
        <QRCodeSVG value={url} size={64} />
      </div>
    </div>
  )
}

