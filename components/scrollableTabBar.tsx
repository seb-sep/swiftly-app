type ScrollableTabBarProps = {
    data: Record<string, TabState>,
    tabState: TabState,
    setTabState: (tabState: TabState) => void,
  }
  
  const ScrollableTabBar: React.FC<ScrollableTabBarProps> = (data: Record<string, TabState>, tabState: TabState, setTabState: (tabState: TabState) => void) => {
    return (
      <FlatList 
        data={Object.keys(data)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setTabState(data[item])}
            style={styles.tab}>
            <Text style={[styles.tabText, tabState == data[item] && {color: "mediumturquoise", textDecorationLine: 'underline'}]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    );
  }