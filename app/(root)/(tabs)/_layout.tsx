import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
// import { icons } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TabIcon = ({ source, focused }: { source: ImageSourcePropType, focused: boolean }) => (
  <View className={`flex flex-row justify-center items-center rounded-full w-12 h-12 ${focused ? 'bg-general-300' : ''}`}>
    <View className={`rounded-full w-12 h-12 items-center justify-center ${focused ? 'bg-general-400' : ""}`}>
      <Image source={source} tintColor="white" resizeMode='contain' className='w-7 h-7' />
    </View>
  </View >
)

const Layout = () => {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs initialRouteName='home' screenOptions={{
      tabBarActiveTintColor: "white",
      tabBarInactiveTintColor: "white",
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: '#333333',
        borderRadius: 50,
        paddingBottom: 27,
        overflow: "hidden",
        marginHorizontal: 20,
        // Bottom inset for n
        bottom: bottom,
        // marginBottom: 20,
        height: 78,
        display: "flex",
        justifyContent: "space-between",
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
      },
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          // tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          title: "Weight",
          headerShown: false,
          // tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />
        }}
      />
      {/* <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.list} />
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.chat} />
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          // tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.profile} />
        }}
      />

    </Tabs>
  )
}

export default Layout