import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/host',
    component: Layout,
    redirect: '/host/list',
    children: [
      {
        path: 'list',
        component: () => import('@/views/host/host'),
        name: '主机列表',
        meta: { title: '主机列表', icon: 'skill', affix: true }
      },
      {
        path: 'tasklist/:id(\\d+)',
        component: () => import('@/views/host/task/list'),
        name: '主机任务列表',
        meta: { title: '主机任务列表', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'task_add/:host_id(\\d+)',
        component: () => import('@/views/host/task/task'),
        name: '新增主机任务',
        meta: { title: '新增主机任务', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'task_edit/:id(\\d+)',
        component: () => import('@/views/host/task/task'),
        name: '修改主机任务',
        meta: { title: '修改主机任务', icon: 'component', affix: false },
        hidden: true
      }
    ]
  },
  {
    path: '/task',
    component: Layout,
    redirect: '/task/list',
    children: [
      {
        path: 'list',
        component: () => import('@/views/task/list'),
        name: '任务列表',
        meta: { title: '任务列表', icon: 'component', affix: true }
      },
      {
        path: 'task_add',
        component: () => import('@/views/task/task'),
        name: '新增任务',
        meta: { title: '新增任务', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'task_edit/:id(\\d+)',
        component: () => import('@/views/task/task'),
        name: '修改任务',
        meta: { title: '修改任务', icon: 'component', affix: false },
        hidden: true
      }
    ]
  },
  {
    path: '/bak',
    component: Layout,
    redirect: '/bak/list',
    children: [
      {
        path: 'list',
        component: () => import('@/views/bak/bakhistory'),
        name: '备份历史记录',
        meta: { title: '备份历史记录', icon: 'skill', affix: false }
      }
    ]
  },
  {
    path: '/cluster',
    component: Layout,
    redirect: 'noRedirect',
    name: '集群管理',
    meta: {
      title: '集群管理',
      icon: 'chart'
    },
    children: [
      {
        path: 'service',
        component: () => import('@/views/cluster/service/serviceList'),
        name: '服务列表',
        meta: { title: '服务列表', noCache: true }
      },
      {
        path: 'list/:servicename',
        component: () => import('@/views/cluster/service/task/list'),
        name: '集群任务列表',
        meta: { title: '集群任务列表',  noCache: true },
        hidden: true
      },
      {
        path: 'elastic/list/:servicename',
        component: () => import('@/views/cluster/service/elastic/es_task_list'),
        name: 'ElasticSearch任务列表',
        meta: { title: 'ElasticSearch任务列表',  noCache: true },
        hidden: true
      },
      {
        path: 'es_task_add/:servicename/:action',
        component: () => import('@/views/cluster/service/elastic/es_task'),
        name: '新增ES任务',
        meta: { title: '新增ES任务', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'es_task_edit/:id(\\d+)/:servicename/:action',
        component: () => import('@/views/cluster/service/elastic/es_task'),
        name: '编辑ES任务',
        meta: { title: '编辑ES任务', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'host',
        component: () => import('@/views/cluster/host/serviceHost'),
        name: '主机管理',
        meta: { title: '主机管理', noCache: true }
      },
      {
        path: 'history',
        component: () => import('@/views/cluster/history/bakhistory'),
        name: '备份历史',
        meta: { title: '备份历史', noCache: true }
      },
      {
        path: 'snapshot',
        component: () => import('@/views/cluster/service/elastic/es_history'),
        name: '快照历史',
        meta: { title: '快照历史', noCache: true }
      },
      {
        path: 'task_add/:hostid(\\d+)/:servicename/:action',
        component: () => import('@/views/cluster/service/task/task'),
        name: '新增任务',
        meta: { title: '新增任务', icon: 'component', affix: false },
        hidden: true
      },
      {
        path: 'task_edit/:hostid(\\d+)/:taskid(\\d+)/:servicename/:action',
        component: () => import('@/views/cluster/service/task/task'),
        name: '修改任务',
        meta: { title: '修改任务', icon: 'component', affix: false },
        hidden: true
      },
    ]
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '404'
  },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = []

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
