package com.musicplayer.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(AudioPlaybackServicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
