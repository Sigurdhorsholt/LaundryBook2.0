import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetPropertyInfoQuery } from '../../../features/properties/propertiesApi'
import { HouseRulesEditor } from '../../../features/properties/HouseRulesEditor'
import { PageHeader, ErrorState, Spinner } from '../../../shared/ui'

export function PropertyHouseRulesPage() {
  const { t } = useTranslation()
  const { propertyId } = useParams<{ propertyId: string }>()
  const info = useGetPropertyInfoQuery(propertyId ?? skipToken)

  return (
    <div className="p-4 p-lg-5">
      <PageHeader eyebrow={info.data?.name} title={t('houseRules.title')} description={t('houseRules.adminDescription')} />
      {info.isError ? (
        <ErrorState title={t('propertyInfo.loadErrorTitle')} description={t('laundryPage.loadErrorDescription')} onRetry={info.refetch} />
      ) : !info.data || !propertyId ? (
        <Spinner fullPage />
      ) : (
        <HouseRulesEditor propertyId={propertyId} saved={info.data.houseRules} updatedAt={info.data.houseRulesUpdatedAt} />
      )}
    </div>
  )
}
