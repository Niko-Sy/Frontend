<template>
  <section class="error-page">
    <h1>403</h1>
    <h2>暂无访问权限</h2>
    <p>当前账号没有访问该页面的权限，请切换账号或回到首页。</p>
    <div class="action-row">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      <el-button @click="$router.push('/login')">重新登录</el-button>
    </div>
  </section>
</template>
