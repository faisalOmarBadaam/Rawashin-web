import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const queryClientConfig = new QueryClient({
   queryCache: new QueryCache({
    onError: (error) => {
      if (!isServerProblemDetailsError(error)) return

      toast.error(error.title)
    },
  }),
   mutationCache: new MutationCache({
    onError: (error) => {
      if (!isServerProblemDetailsError(error)) return

      toast.error(error.title)
    },
  }),
  defaultOptions: {
    queries: {
      // البيانات تعتبر fresh لمدة 1 دقيقة
      staleTime: 1000 * 60,

      // البيانات غير المستخدمة تبقى في الكاش 5 دقائق
      gcTime: 1000 * 60 * 5,

      // يعيد المحاولة مرة واحدة فقط عند فشل الطلب
      retry: 1,

      // لا يعيد الطلب كل ما ترجع لنافذة المتصفح
      refetchOnWindowFocus: false,

      // يعيد الطلب إذا رجع الاتصال بالإنترنت
      refetchOnReconnect: true,

      // لا يعيد الطلب عند كل mount إذا البيانات ما زالت fresh
      refetchOnMount: true
    },
    mutations: {
      // لا يعيد محاولة mutations تلقائيًا
      retry: 0
    }
  }
})

export default queryClientConfig